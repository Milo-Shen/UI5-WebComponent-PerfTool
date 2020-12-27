// Import libs
const Fs = require("fs");
const Path = require("path");

/**
 * function: delete folders & files
 * @param path
 */
function deleteFolderRecursive(path) {
  if (!Fs.existsSync(path)) return;
  Fs.readdirSync(path).forEach((file, index) => {
    const curPath = Path.join(path, file);
    if (Fs.lstatSync(curPath).isDirectory()) {
      deleteFolderRecursive(curPath);
    } else {
      Fs.unlinkSync(curPath);
    }
  });
  Fs.rmdirSync(path);
}

/**
 * delete a certain file
 * @param path
 */
function deleteFile(path) {
  if (!Fs.existsSync(path)) return;
  Fs.unlinkSync(path);
}

/**
 * function: copy files from src to dest
 * @param src
 * @param dest
 */
function copyFileRecursive(src, dest) {
  if (!Fs.existsSync(src)) return false;
  if (!Fs.existsSync(dest)) mkFolderSyncRecursive(dest);
  Fs.readdirSync(src).forEach(function (item) {
    let itemPath = Path.join(src, item);
    let temp = Fs.statSync(itemPath);
    if (temp.isFile()) {
      Fs.copyFileSync(itemPath, Path.join(dest, item));
    } else if (temp.isDirectory()) {
      copyFileRecursive(itemPath, Path.join(dest, item));
    }
  });
}

/**
 * function: create folders
 * @param dirname
 */
function mkFolderSyncRecursive(dirname) {
  if (Fs.existsSync(dirname)) return true;
  if (mkFolderSyncRecursive(Path.dirname(dirname))) {
    Fs.mkdirSync(dirname);
    return true;
  }
}

/**
 * function: empty the folder
 * @param path
 */
function resetFolderRecursive(path) {
  deleteFolderRecursive(path);
  mkFolderSyncRecursive(path);
}

/**
 * function: traversal all files in a dictionary
 * @param path
 * @param fileCallback
 * @param dirCallback
 */
function walk(path, fileCallback, dirCallback) {
  let dirList = Fs.readdirSync(path);
  dirList.forEach(function (item) {
    let itemPath = Path.join(path, item);
    if (Fs.statSync(itemPath).isDirectory()) {
      dirCallback && dirCallback(itemPath);
      walk(itemPath, fileCallback, dirCallback);
    } else {
      fileCallback && fileCallback(itemPath);
    }
  });
}

/**
 * function: walk one layer of a folder
 * @param path
 * @param fileCallback
 */
function walkSingle(path, fileCallback) {
  let dirList = Fs.readdirSync(path);
  dirList.forEach(function (item) {
    let itemPath = Path.join(path, item);
    if (!Fs.statSync(itemPath).isDirectory()) {
      fileCallback && fileCallback(itemPath);
    }
  });
}

/**
 * function: safe write file
 * @param path
 * @param data
 * @param encoder
 */
function safeWriteFile(path, data, encoder = "utf-8") {
  if (!Fs.existsSync(Path.dirname(path))) {
    throw new Error("The path is not exists !");
  }
  Fs.writeFileSync(path, data, encoder);
}

module.exports = {
  walk,
  walkSingle,
  deleteFile,
  copyFileRecursive,
  mkFolderSyncRecursive,
  deleteFolderRecursive,
  safeWriteFile,
  resetFolderRecursive
};
