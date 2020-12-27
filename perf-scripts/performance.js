// Import third party libs
const os = require("os");
const fs = require("fs");
const path = require("path");
const express = require("express");
const serveStatic = require("serve-static");
const compression = require("compression");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const log = require("lighthouse-logger");
const git = require("simple-git")();

// Import self code
const IO = require("./io");
const { tryUsePort } = require("./network");
const { execCommand } = require("./util");
const { convertHtmlToReact } = require("./compile");

// Paths
const dirname = path.dirname(__dirname);
const ui5_repo = "https://github.com/SAP/ui5-webcomponents.git";
const ui5_folder = path.resolve(dirname, "ui5-webcomponents");
const ui5_main_samples = path.resolve(ui5_folder, "packages/main/test/samples");
const ui5_fiori_samples = path.resolve(ui5_folder, "packages/fiori/test/samples");
const ui5_main_dist = path.resolve(dirname, "node_modules/@ui5/webcomponents/dist");
const ui5_fiori_dist = path.resolve(dirname, "node_modules/@ui5/webcomponents-fiori/dist");
const converted_main = path.resolve(dirname, "converted/main");
const converted_fiori = path.resolve(dirname, "converted/fiori");
const build = path.resolve(dirname, "build");
const output = path.resolve(dirname, "output");

// Constant
const EOL = os.EOL;
const encoding = "utf8";
const jsSuffix = ".js";
const tagReg = /tag: *."(.*?)",/gi;

// Store
const mapTag = {};
const keyMap = {};

/**
 * function: generate map
 * @param folderPath
 */
function generateMap(folderPath) {
  IO.walkSingle(folderPath, (file) => {
    // get lib name
    const libName = folderPath.slice(folderPath.lastIndexOf("@"));
    // get folder name according to tag name
    let regRes = null;
    const extname = path.extname(file);
    const basename = path.basename(file, jsSuffix);
    if (extname !== jsSuffix) return;
    const fileContent = fs.readFileSync(file, encoding);
    while ((regRes = tagReg.exec(fileContent))) {
      const key = String(regRes[1]).toLowerCase();
      mapTag[key] = { folder: basename, lib: libName };
    }
  });
}

(async function f() {
  const isUI5Available = fs.existsSync(ui5_folder);
  if (!isUI5Available) {
    await git.clone(ui5_repo, ui5_folder);
  }

  // Prepare folder - main & fiori
  IO.resetFolderRecursive(converted_main);
  IO.resetFolderRecursive(converted_fiori);

  // Generate Map - Main
  generateMap(ui5_main_dist);

  // Generate Map - Fiori
  generateMap(ui5_fiori_dist);

  // Read App Temp
  const builtArray = [];
  const compiledArray = [];

  // Generate examples - main
  convertHtmlToReact(ui5_main_samples, converted_main, builtArray, mapTag, keyMap);

  // Generate examples - fiori
  convertHtmlToReact(ui5_fiori_samples, converted_fiori, builtArray, mapTag, keyMap);

  //to do
  return;

  // generate react project
  const appJs = path.resolve(dirname, "src/App.js");
  const appContent = fs.readFileSync(appJs, encoding);
  const start = new Date();
  let curTask = 0;
  let totalTask = builtArray.length;

  for (let i = 0, len = builtArray.length; i < len; i++) {
    const file = builtArray[i];
    const fileContent = fs.readFileSync(file, encoding);
    fs.writeFileSync(appJs, fileContent, encoding);
    const folder = path.dirname(file);
    const destBuild = path.resolve(folder, "build");
    compiledArray.push(destBuild);
    await execCommand("npm run build");
    fs.renameSync(build, destBuild);
    const progress = +((++curTask / totalTask) * 100).toFixed(2);
    const elapsedTime = +((new Date() - start) / 1000).toFixed(2);
    console.log(
      `build progress: ${progress}%, current: ${curTask}, total task: ${totalTask}, elapsed time: ${elapsedTime} s`
    );
  }

  fs.writeFileSync(appJs, appContent, encoding);
  console.log("build successfully !");

  // create express server
  const app = express();

  function setCustomCacheControl(res, path) {
    if (serveStatic["mime"].lookup(path) === "text/html") {
      res.setHeader("Cache-Control", "public, max-age=0");
    }
  }

  app.use(compression());
  app.use(serveStatic(build, { maxAge: "1d", setHeaders: setCustomCacheControl }));

  // open express server
  await tryUsePort(5001, (port) => {
    const server = app.listen(port, async () => {
      console.log("express server start on port: 5555");

      let testOutput = "";
      curTask = 0;
      totalTask = compiledArray.length;

      for (let i = 0, len = compiledArray.length; i < len; i++) {
        let scoreStr = "";
        const builtSrc = compiledArray[i];

        // copy compiled code to build folder
        IO.resetFolderRecursive(build);
        IO.copyFileRecursive(builtSrc, build);

        // using LightHouse
        log.setLevel("info");
        const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
        const options = {
          output: "html",
          onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
          port: chrome.port,
          throttling: {
            cpuSlowdownMultiplier: 4,
            rttMs: 0,
            throughputKbps: 0,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
        };
        const runnerResult = await lighthouse("http://127.0.0.1:5555", options);

        // `.report` is the HTML report as a string
        const reportHtml = String(runnerResult.report);
        const dirBuiltPath = path.dirname(builtSrc);
        const testedName = path.basename(dirBuiltPath);
        const destPath = path.resolve(dirBuiltPath, "lighthouseReport.html");
        fs.writeFileSync(destPath, reportHtml, encoding);

        // `.lhr` is the Lighthouse Result as a JS object
        const categories = runnerResult.lhr.categories;
        for (let key in categories) {
          if (categories.hasOwnProperty(key)) {
            const score = categories[key].score * 100;
            scoreStr += `${key}: ${score}|`;
          }
        }

        testOutput += `|${testedName}| ${scoreStr}${EOL}`;
        console.log("Report is done for: ", testedName);
        console.log(scoreStr);

        await chrome.kill();

        // calculate time
        const progress = +((++curTask / totalTask) * 100).toFixed(2);
        const elapsedTime = +((new Date() - start) / 1000).toFixed(2);
        console.log(
          `test progress: ${progress}%, current: ${curTask}, total task: ${totalTask}, elapsed time: ${elapsedTime} s ${EOL}`
        );
      }

      const outputFile = path.resolve(output, "score.txt");
      fs.writeFileSync(outputFile, testOutput, encoding);
      server.close();
    });
  });
})();
