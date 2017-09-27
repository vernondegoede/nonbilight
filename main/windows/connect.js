const { BrowserWindow, app, ipcMain } = require("electron");

function showConnectWindow(fn, options = {}) {
  const devPath = "http://localhost:8000/hue-connect";

  const prodPath = format({
    pathname: resolve("renderer/out/hue-connect/index.html"),
    protocol: "file:",
    slashes: true,
  });

  const url = isDev ? devPath : prodPath;

  const connectHueWindow = new BrowserWindow({
    width: 400,
    height: 450,
    resizable: false,
    vibrancy: "light",
    minimizable: false,
    maximizable: false,
    frame: false,
    transparent: true,
    titleBarStyle: "hidden-inset",
    "web-preferences": {
      "web-security": false,
    },
  });

  connectHueWindow.loadURL(url);
}

module.exports = showConnectWindow;
