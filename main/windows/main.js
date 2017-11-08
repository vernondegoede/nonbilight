const { BrowserWindow } = require("electron");
const { resolve } = require("app-root-path");
const { format } = require("url");
const isDev = require("electron-is-dev");

function loadMainWindow(fn, options = {}) {
  const devPath = "http://localhost:8000/main";

  const prodPath = format({
    pathname: resolve("renderer/out/main/index.html"),
    protocol: "file:",
    slashes: true,
  });

  const url = isDev ? devPath : prodPath;

  const mainWindow = new BrowserWindow({
    width: 260,
    height: 285,
    resizable: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    frame: false,
    movable: false,
    title: "Nonbilight",
    "web-preferences": {
      "web-security": false,
      backgroundThrottling: false,
    },
  });

  mainWindow.loadURL(url);

  return mainWindow;
}

module.exports = loadMainWindow;
