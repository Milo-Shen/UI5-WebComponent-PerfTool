// Import third party libs
const os = require("os");
const fs = require("fs");
const path = require("path");
const jsDom = require("jsdom");
const prettier = require("prettier");

// Import self code
const IO = require("./io");
const { traversal, removeComment } = require("./util");
const prettierConfig = require("../prettier.config");

// Paths
const dirname = path.dirname(__dirname);
const ui5_temp = path.resolve(dirname, "template", "AppTemplate");

// Constant
const EOL = os.EOL;
const encoding = "utf8";
const htmlSuffix = ".html";
const classReg = /class=".*?"/gi;
const styleReg = /style=".*?"/gi;
const folderNormalizeReg = /[<>/\\|:*?"]/gi;
const appTemp = fs.readFileSync(ui5_temp, encoding);

/**
 * function: convert ui5 example html to react project
 * @param samples
 * @param convertedFolder
 * @param builtArray
 * @param mapTag
 * @param keyMap
 */
function convertHtmlToReact(samples, convertedFolder, builtArray, mapTag, keyMap) {
  IO.walk(samples, (file) => {
    const extname = path.extname(file);
    if (extname !== htmlSuffix) return;
    const basename = path.basename(file);
    const fileContent = fs.readFileSync(file, encoding);
    const dom = new jsDom.JSDOM(fileContent);

    // remove pres - code example for document
    const pres = dom.window.document.querySelectorAll("pre");
    if (pres.length) pres.forEach((pre) => pre.remove());

    // get sections
    let sections = dom.window.document.querySelectorAll("section");
    if (!sections.length) return;

    sections.forEach((section) => {
      // remove styles and scripts from example section
      const scripts = section.querySelectorAll("script");
      if (scripts.length) scripts.forEach((script) => script.remove());
      const styles = section.querySelectorAll("style");
      if (styles.length) styles.forEach((style) => style.remove());
      // add alt attribute to img tag
      const images = section.querySelectorAll("img");
      if (images.length) images.forEach((image) => image.setAttribute("alt", "perf-tool"));
    });

    // remove comments and compile html to jsx
    sections = [...dom.window.document.body.children].filter((x) => x.tagName.toLowerCase() === "section");

    // take each section as an example
    sections.forEach((section, index) => {
      removeComment(section);
      let importJsx = "";
      let tags = traversal(section, (_dom) => {
        removeComment(_dom);
      });
      tags = tags.map((x) => String(x.tagName).toLowerCase());

      // Import Used components
      [...new Set(tags)]
        .filter((x) => !!x.includes("ui5"))
        .forEach((_tag) => {
          const tag = keyMap[_tag] || _tag;
          const componentInfo = mapTag[tag];
          if (componentInfo) {
            importJsx += `import "${componentInfo.lib}/${componentInfo.folder}"${EOL}`;
          } else importJsx += `\/\/ ignore import ${tag} ${EOL}`;
        });
      let innerJSX = section.innerHTML;
      innerJSX = prettier.format(innerJSX, { parser: "html", printWidth: 200 });

      // convert html syntax to react syntax ( class -> className & style -> {{ style name: style value }} )
      innerJSX = innerJSX
        .replace(classReg, (x) => x.split("=").join("Name="))
        .replace(styleReg, (x) => {
          const result = x.split("=");
          const attributes = result[1]
            .replace(/"/gi, "")
            .split(";")
            .filter((x) => x)
            .map((attr) => {
              const keyValue = attr.split(":").map((x) => x.trim());
              keyValue[0] = keyValue[0]
                .split("-")
                .map((x, index) => {
                  if (index === 0) return x;
                  return x.charAt(0).toUpperCase() + x.slice(1);
                })
                .join("");
              keyValue[1] = `"${keyValue[1]}"`;
              return keyValue.join(":");
            })
            .join(",");
          result[1] = `{{${attributes}}}`;
          return result.join("=");
        });
      let result = appTemp.replace("%import-component-jsx%", innerJSX).replace("%import-component%", importJsx);
      result = prettier.format(result, prettierConfig);
      let sampleName = section.children[0].innerHTML || `section-${index}`;
      sampleName = sampleName.replace(folderNormalizeReg, "-");
      const folderName = basename.replace(".sample.html", "");
      const builtPath = path.resolve(convertedFolder, folderName, sampleName);
      const builtFile = path.resolve(builtPath, `index.js`);
      builtArray.push({ path: builtFile, sampleName });
      IO.mkFolderSyncRecursive(builtPath);
      fs.writeFileSync(builtFile, result, encoding);
      console.log(`UI5 example converted: ${sampleName}`);
    });
  });
}

module.exports = { convertHtmlToReact };
