const { BrowserWindow } = require("electron");
const { resolve } = require("app-root-path");
const { format } = require("url");
const isDev = require("electron-is-dev");

function loadArrowWindow(fn, options = {}) {
  const devPath = "http://localhost:8000/arrow";

  const prodPath = format({
    pathname: resolve("renderer/out/main/arrow.html"),
    protocol: "file:",
    slashes: true,
  });

  const url = isDev ? devPath : prodPath;

  const arrowWindow = new BrowserWindow({
    width: 260,
    height: 285,
    resizable: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    transparent: true,
    frame: false,
    movable: false,
    title: "Nonbilight",
    "web-preferences": {
      "web-security": false,
    },
  });

  arrowWindow.loadURL(url);

  return arrowWindow;
}

module.exports = loadArrowWindow;
