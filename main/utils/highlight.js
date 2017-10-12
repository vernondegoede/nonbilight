// Packages
const { app } = require('electron')

const states = {
  hide: false,
  show: true,
  minimize: false,
  restore: true,
  focus: true
}

module.exports = (win, tray) => {
  if (!tray) {
    return
  }

  for (const state in states) {
    if (!{}.hasOwnProperty.call(states, state)) {
      return
    }

    const highlighted = states[state]

    win.on(state, () => {
      // Highlight the tray or don't
      tray.setHighlightMode(highlighted ? 'always' : 'selection')
    })
  }

  app.on('before-quit', () => {
    win.destroy()
  })

  win.on('close', event => {
    event.preventDefault()
    win.hide()
  })
}