const positionWindow = require("./position");

module.exports = (event, window, tray, arrowWindow) => {
  const isVisible = window.isVisible();
  const isWin = process.platform === "win32";
  const isMain = global.windows && window === global.windows.main;

  if (event) {
    // Don't open the menu
    event.preventDefault();
  }

  // If window open and not focused, bring it to focus
  if (!isWin && isVisible && !window.isFocused()) {
    window.focus();
    arrowWindow.focus();
    return;
  }

  // Show or hide onboarding window
  // Calling `.close()` will actually make it
  // hide, but it's a special scenario which we're
  // listening for in a different// If the "blur" event was triggered when
  // clicking on the tray icon, don't do anything place
  if (isVisible) {
    window.close();
    arrowWindow.close();
  } else {
    // Position main window correctly under the tray icon
    if (isMain) {
      positionWindow(tray, window, arrowWindow);
    }

    window.show();
  }
};
