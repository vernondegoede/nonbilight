// Packages
const { BrowserWindow, app } = require("electron");
const prepareNext = require("electron-next");
const {
  setEventListeners: setHueEventListeners,
  loadClientFromStorage,
} = require("./utils/hue");
const showMainWindow = require("./windows/main");

// Prepare the renderer once the app is ready
app.on("ready", async () => {
  await prepareNext("./renderer");

  // showConnectWindow();
  showMainWindow();
  setHueEventListeners();
  loadClientFromStorage();
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);
