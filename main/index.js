// Packages
const { BrowserWindow, app } = require("electron");
const prepareNext = require("electron-next");
const showMainWindow = require("./windows/main");

// Prepare the renderer once the app is ready
app.on("ready", async () => {
  await prepareNext("./renderer");

  showMainWindow();
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);
