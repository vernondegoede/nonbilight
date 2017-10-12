const getMainWindow = require("./../../windows/main");
const getArrowWindow = require("./../../windows/arrow");

// Utilities
const attachTrayState = require("../highlight");
const positionWindow = require("./position");

// Check if Windows
const isWinOS = process.platform === "win32";

exports.mainWindow = tray => {
  const window = getMainWindow();

  positionWindow(tray, window);
  attachTrayState(window, tray);

  // Hide window if it's not focused anymore
  // This can only happen if the dev tools are not open
  // Otherwise, we won't be able to debug the renderer
  window.on("blur", () => {
    if (window.webContents.isDevToolsOpened()) {
      return;
    }

    if (!isWinOS) {
      window.close();
      return;
    }

    const { screen } = electron;
    const cursor = screen.getCursorScreenPoint();
    const trayBounds = global.tray.getBounds();

    const xAfter = cursor.x <= trayBounds.x + trayBounds.width;
    const x = cursor.x >= trayBounds.x && xAfter;
    const yAfter = trayBounds.y + trayBounds.height;
    const y = cursor.y >= trayBounds.y && cursor.y <= yAfter;

    // Don't close the window on click on the tray icon
    // Because that will already toogle the window
    if (x && y) {
      return;
    }

    window.close();
  });

  return window;
};

exports.arrowWindow = () => {
  const arrowWindow = getArrowWindow();

  return arrowWindow;
}