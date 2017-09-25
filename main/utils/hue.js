const huejay = require("huejay");
const { ipcMain } = require("electron");
const settings = require("electron-settings");
const { random } = require("lodash");

const colors = require("./colors");

let client;

const getClosestBridge = async event => {
  const bridges = await huejay.discover();
  event.sender.send("list-closest-bridges", bridges);
};

const isHexColor = inputColor => {
  return inputColor.includes("#");
};

const parseRgbColor = color => {
  console.log("color before extracting", color);
  const extractedColors = color.match(/([0-9]{1,}),([0-9]{1,}),([0-9]{1,})/);
  console.log("extractedColors", extractedColors);
  return extractedColors[0].split(",");
};

const authorizeClient = (host, username) => {
  client = new huejay.Client({
    host,
    username,
  });

  settings.set("bridge", {
    host,
    username,
  });
};

const connectToBridge = async (event, host) => {
  client = new huejay.Client({
    host,
  });

  let user = new client.users.User();
  user.deviceType = "hue_desktop";
  try {
    const { username } = await client.users.create(user);

    // Instantiate new client with newly created username
    authorizeClient(host, username);

    try {
      const isAuthenticated = await client.bridge.isAuthenticated();
      event.sender.send("bridge-connected");
    } catch (error) {
      event.sender.send("bridge-connection-error");
    }
  } catch (error) {
    event.sender.send("bridge-connection-error");
  }
};

const setLightColor = async (event, color, lightId) => {
  const lights = await client.lights.getAll();

  const updateColor = async id => {
    const light = await client.lights.getById(id);
    const lightColor = isHexColor(color)
      ? colors.hexToCIE1931(color.replace("#", ""))
      : colors.rgbToCIE1931(
          parseRgbColor(color)[0],
          parseRgbColor(color)[1],
          parseRgbColor(color)[2],
        );

    light.brightness = random(1, 2);
    light.xy = lightColor;
    light.transitionTime = 1;
    client.lights.save(light);
  };

  if (lightId) {
    return updateColor(lightId);
  }

  lights.map(async ({ id }) => updateColor(lightId));
};

const getLights = async event => {
  const lights = await client.lights.getAll();
  event.sender.send("list-lights", lights);
};

const loadClientFromStorage = () => {
  if (settings.has("bridge.username")) {
    const host = settings.get("bridge.host");
    const username = settings.get("bridge.username");

    authorizeClient(host, username);
  }
};

const setEventListeners = () => {
  ipcMain.on("get-closest-bridges", getClosestBridge);
  ipcMain.on("connect-to-bridge", connectToBridge);
  ipcMain.on("set-light-color", setLightColor);
  ipcMain.on("get-lights", getLights);
};

module.exports = {
  getClosestBridge,
  setEventListeners,
  loadClientFromStorage,
};
