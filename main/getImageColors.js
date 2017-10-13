const getPixels = require("get-pixels");
const getRgbaPalette = require("get-rgba-palette");
const chroma = require("chroma-js");
const getSvgColors = require("get-svg-colors");
const pify = require("pify");

const LOW_THRESHOLD = 10;
const MID_THRESHOLD = 40;
const HIGH_THRESHOLD = 240;

const MIN_BRIGHTNESS = 0;
const MAX_BRIGHTNESS = 254;

const patterns = {
  image: /\.(gif|jpg|png|svg)$/i,
  raster: /\.(gif|jpg|png)$/i,
  svg: /svg$/i,
};

function calculateBrightness(darknessRatio, minBrightness, maxBrightness) {
  const brightness = maxBrightness - darknessRatio * maxBrightness / 100;

  return brightness;
}

function colorPalette(input, type, callback) {
  if (typeof type === "function") {
    callback = type;
    type = null;
  }

  // SVG
  if (!Buffer.isBuffer(input)) {
    if (input.match(patterns.svg)) {
      return callback(null, getSvgColors(input, { flat: true }));
    }
  } else if (type === "image/svg+xml") {
    return callback(null, getSvgColors(input, { flat: true }));
  }

  // PNG, GIF, JPG
  return paletteFromBitmap(input, type, callback);
}

function paletteFromBitmap(filename, type, callback) {
  if (!callback) {
    callback = type;
    type = null;
  }

  let darkPixels = 0;
  let totalPixels = 0;

  const tresholdFilter = (pixels, index) => {
    const red = pixels[index + 0];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];

    totalPixels++;

    // Don't count pixels that are too dark
    if (red < LOW_THRESHOLD && green < LOW_THRESHOLD && blue < LOW_THRESHOLD) {
      darkPixels++;
      return false;
      // Or too light
    } else if (
      red > HIGH_THRESHOLD &&
      green > HIGH_THRESHOLD &&
      blue > HIGH_THRESHOLD
    ) {
      return false;
    } else {
      return true;
    }
  };

  getPixels(filename, type, function(err, pixels) {
    if (err) return callback(err);
    const quality = 10;
    const palette = getRgbaPalette(
      pixels.data,
      1,
      quality,
      tresholdFilter,
    ).map(function(rgba) {
      return chroma(rgba);
    });

    const color = palette[0];

    if (!color) {
      return {
        color: [0, 0, 0],
        brightness: 0,
      };
    }
    // If computed average below darkness threshold, set to the threshold
    if (
      color._rgb[0] <= LOW_THRESHOLD &&
      color._rgb[1] <= LOW_THRESHOLD &&
      color._rgb[2] <= LOW_THRESHOLD
    ) {
      color = [LOW_THRESHOLD, LOW_THRESHOLD, LOW_THRESHOLD];
    }

    const darkRatio = parseFloat(darkPixels) / parseFloat(totalPixels) * 100;
    const brightness = calculateBrightness(
      darkRatio,
      MIN_BRIGHTNESS,
      MAX_BRIGHTNESS,
    );

    return callback(null, {
      color,
      brightness,
    });
  });
}

module.exports = pify(colorPalette);
