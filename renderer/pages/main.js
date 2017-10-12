// Node
import { Component } from "react";
import electron from "electron";
import settings from "electron-settings";
import { random } from "lodash";

// Components
import TheaterMode from "./../components/TheaterMode";
import Tabs from "./../components/Tabs";

// Utils
import colorUtils from "./../utils/colors";
import { globalStyles } from "./../styles/pages/main";

const THEATER_MODE = "theater_mode";
const MANUAL_MODE = "manual_mode";
const TABS = [MANUAL_MODE, THEATER_MODE];

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isConnected: true,
      activeTab: THEATER_MODE,
      colors: [],
      client: null,
    };

    this.remote = electron.remote || false;
    this.switchMultipleLights = this.switchMultipleLights.bind(this);
  }

  async componentDidMount() {
    await this.connectLocalHueBridge();
    await this.getLights();
  }

  componentWillUnmount() {
    this.remote.getCurrentWindow().removeAllListeners();
  }

  async connectLocalHueBridge() {
    return new Promise(async resolve => {
      const huejay = this.remote.require("huejay");
      const host = settings.get("bridge.host");
      const username = settings.get("bridge.username");

      const callback = async () => {
        try {
          const isAuthenticated = await this.state.client.bridge.isAuthenticated();
          resolve();
        } catch (error) {
          console.warn("⚠️ Could not connect to bridge ⚠️", error);
        }
      };

      this.setState(
        {
          client: new huejay.Client({
            host,
            username,
          }),
        },
        callback,
      );
    });
  }

  async getLights() {
    return new Promise(async resolve => {
      const lights = await this.state.client.lights.getAll();
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

      const hueLight = await this.state.client.lights.getById(
        lightReference.attributes.attributes.id,
      );
      hueLight.xy = CIE1931ColorValue;
      hueLight.transitionTime = 1;
      this.state.client.lights.save(hueLight);
    });
  }

  switchMultipleLights(colors) {
    const callback = () => this.setLightColors();
    this.setState(
      {
        colors,
      },
      callback,
    );
  }

  renderTabContents() {
    const { activeTab, colors } = this.state;
    const childProps = {
      remote: this.remote,
      switchMultipleLights: this.switchMultipleLights,
      client: this.state.client,
      colors,
    };

    switch (activeTab) {
      case THEATER_MODE:
        return <TheaterMode {...childProps} />;
    }
  }

  render() {
    const { activeTab, isConnected } = this.state;
    const content = this.renderTabContents();

    return (
      <div>
        <main>
          <Tabs tabs={TABS} activeTab={activeTab} />
          <div className="main">
            {isConnected ? content : <h1>Please connect</h1>}
          </div>
        </main>
        <style jsx global>
          {globalStyles}
        </style>
      </div>
    );
  }
}
