// Node
import { Component } from "react";
import electron from "electron";
import path from "path";
import settings from "electron-settings";
import { random } from 'lodash';

// Utils
import colorUtils from "./../utils/colors";

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      colors: [],
    };

    this.remote = electron.remote || false;
    this.client = null;
  }

  async componentDidMount() {
    await this.connectLocalHueBridge();
    await this.getLights();

    // Wait until bridge is connected and lights found
    this.initScreenObserver();
  }

  async connectLocalHueBridge() {
    return new Promise(async resolve => {
      const huejay = this.remote.require("huejay");
      const host = settings.get("bridge.host");
      const username = settings.get("bridge.username");

      this.client = new huejay.Client({
        host,
        username,
      });

      try {
        const isAuthenticated = await this.client.bridge.isAuthenticated();
        resolve();
      } catch (error) {
        console.warn("⚠️ Could not connect to bridge ⚠️", error);
      }
    });
  }

  initScreenObserver() {
    const screenshot = this.remote.require("desktop-screenshot");
    const getColors = this.remote.require("get-image-colors");
    const app = this.remote.app;

    const read = async () => {
      if (!this.client) {
        return false;
      }

      try {
        const colors = await getColors(path.join("screenshot.png"));
        const callback = () => this.setLightColors();
        this.setState(
          {
            colors,
          },
          callback,
        );
      } catch (err) {
        console.log("Something weird happened 🤔", err);
      } finally {
        read();
      }
    };

    setInterval(() => {
      screenshot("screenshot.png", {});
    }, 500);
    read();
  }

  async getLights() {
    return new Promise(async resolve => {
      const lights = await this.client.lights.getAll();
      const callback = () => resolve();
      this.setState(
        {
          lights,
        },
        callback,
      );
    });
  }

  async setLightColors() {
    this.state.lights.map(async (lightReference, index) => {
      const correspondingColor = this.state.colors[index].rgb();
      const CIE1931ColorValue = colorUtils.rgbToCIE1931(...correspondingColor);

      const hueLight = await this.client.lights.getById(lightReference.attributes.attributes.id);
      hueLight.xy = CIE1931ColorValue;
      hueLight.transitionTime = 1;
      hueLight.brightness = random(1, 120);
      this.client.lights.save(hueLight);
    });
  }

  parseDisplayRgbValue(values) {
    return `rgba(${values.join(",")})`;
  }

  render() {
    const { colors } = this.state;

    return (
      <div>
        {colors.map(({ _rgb }) => (
          <div
            key={_rgb}
            style={{
              display: "inline-block",
              width: "30px",
              height: "30px",
              backgroundColor: this.parseDisplayRgbValue(_rgb),
            }}
          />
        ))}
      </div>
    );
  }
}
