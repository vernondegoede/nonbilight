var sys = require("util");
var exec = require("child_process").exec;

const getAudioVolume = () =>
  new Promise((resolve, reject) => {
    function puts(error, stdout, stderr) {
      const audioVolume = stdout.split(",");
      const outputVolume = audioVolume[0].split(":")[1];
      resolve(outputVolume);
    }
    exec("osascript -e 'get volume settings'", puts);
  });

module.exports = getAudioVolume;
