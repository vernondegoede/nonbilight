// Packages
const electron = require("electron");
const { BrowserWindow, app } = require("electron");
const prepareNext = require("electron-next");
const isDev = require("electron-is-dev");
const { resolve: resolvePath } = require("app-root-path");

// Utilities
const windowList = require("./utils/frames/list");
const toggleWindow = require("./utils/frames/toggle");

// Prepare the renderer once the app is ready
app.on("ready", async () => {
  // Prevent garbage collection
  // Otherwise the tray icon would randomly hide after some time
  let tray;

  // Set the application's name
  app.setName("Nonbilight");

  if (isDev && process.platform === "darwin") {
    app.dock.hide();
  }

  await prepareNext("./renderer");

  tray = new electron.Tray(resolvePath(`./main/static/tray/iconTemplate.png`));

  const { mainWindow, arrowWindow } = windowList;

  const windows = {
    main: mainWindow(tray),
    arrow: arrowWindow()
  };

  global.tray = tray;
  global.windows = windows;

  const toggleMainWindow = async event => {
    toggleWindow(event || null, windows.main, tray, windows.arrow);
    return;
  };

  tray.on("click", toggleMainWindow);
  tray.on("double-click", toggleMainWindow);

  // Chrome Command Line Switches
  app.commandLine.appendSwitch("disable-renderer-backgrounding");
});

// Quit the app once all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
