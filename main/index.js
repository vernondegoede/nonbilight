// Native
const { format } = require("url");

// Packages
const { BrowserWindow, app, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");
const { resolve } = require("app-root-path");
const extractScreenColors = require("extract-screen-colors");
const {
  setEventListeners: setHueEventListeners,
  loadClientFromStorage,
} = require("./utils/hue");

const getScreenColors = async (event, arg) => {
  const colors = await extractScreenColors();
  event.sender.send("set-screen-colors", colors);
};

// Prepare the renderer once the app is ready
app.on("ready", async () => {
  await prepareNext("./renderer");

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

  ipcMain.on("get-screen-colors", getScreenColors);

  showConnectWindow();
  setHueEventListeners();
  loadClientFromStorage();
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);
