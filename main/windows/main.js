const { BrowserWindow } = require("electron");
const { resolve } = require("app-root-path");
const { format } = require("url");
const isDev = require("electron-is-dev");

function showMainWindow(fn, options = {}) {
  const devPath = "http://localhost:8000/watch-screen-colors";

  const prodPath = format({
    pathname: resolve("renderer/out/watch-screen-colors/index.html"),
    protocol: "file:",
    slashes: true,
  });

  const url = isDev ? devPath : prodPath;

  const mainWindow = new BrowserWindow({
    width: 400,
    height: 450,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    frame: false,
    transparent: false,
    titleBarStyle: "hidden",
    "web-preferences": {
      "web-security": false,
    },
  });

  mainWindow.loadURL(url);
}

module.exports = showMainWindow;
