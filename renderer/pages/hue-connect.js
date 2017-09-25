import { ipcRenderer } from "electron";
import { Component } from "react";
import settings from "electron-settings";

export default class Main extends Component {
  constructor(props) {
    super(props);

    const isConnected = settings.has("bridge.username");

    this.state = {
      bridges: [],
      selectedBridge: null,
      isConnected,
      isLooking: false,
      isConnecting: false,
      lights: [],
      isWatching: false,
    };
  }

  componentDidMount() {
    if (this.state.isConnected) {
      ipcRenderer.send("get-lights");
    }

    ipcRenderer.on("list-closest-bridges", (event, bridges) => {
      this.setState({
        bridges,
        isLooking: false,
      });
    });

    ipcRenderer.on("bridge-connected", () => {
      this.setState({
        isLooking: false,
        bridges: [],
        isConnected: true,
        isConnecting: false,
      });
    });

    ipcRenderer.on("bridge-connection-error", () => {
      this.setState({
        isLooking: false,
        bridges: [{ ip: this.state.selectedBridge }],
        selectedBridge: false,
        isConnected: false,
        isConnecting: false,
      });
    });

    ipcRenderer.on("set-screen-colors", (event, colors) => {
      this.state.lights.map((light, index) => {
        const { _rgb: colorsArray } = colors[index];
        const color = `rgba(${colorsArray.join(",")})`;
        const lightId = light.attributes.attributes.id;
        this.updateColor(color, index);
      });
    });

    ipcRenderer.on("list-lights", (event, lights) => {
      this.setState({
        lights,
      });
    });
  }

  findBridge() {
    ipcRenderer.send("get-closest-bridges");

    this.setState({
      isLooking: true,
      bridges: [],
    });
  }

  stopInterval() {
    if (this.extractColorsInBackground) {
      clearInterval(this.extractColorsInBackground);
    }

    this.setState({
      isWatching: false,
    });
  }

  extractScreenColors() {
    this.extractColorsInBackground = setInterval(() => {
      ipcRenderer.send("get-screen-colors");
      console.log("Extracting screenshot");
    }, 3000);

    this.setState({
      isWatching: true,
    });
  }

  connectToBridge(bridgeIP) {
    this.setState({
      bridges: [],
      isConnecting: true,
      selectedBridge: bridgeIP,
    });

    setTimeout(() => {
      ipcRenderer.send("connect-to-bridge", bridgeIP);
    }, 3000);
  }

  updateColor(color, lightIndex) {
    const { lights } = this.state;
    const currentLight = lights[lightIndex];

    const lightId = currentLight.attributes.attributes.id;

    const updatedLights = Object.assign([], lights, {
      [lightIndex]: {
        ...currentLight,
        currentColor: color,
      },
    });

    this.setState({
      lights: updatedLights,
    });
    ipcRenderer.send("set-light-color", color, lightId);
  }

  renderConnectionWizard() {
    const {
      isLooking,
      bridges,
      isConnecting,
      isConnected,
      selectedBridge,
      lights,
      isWatching,
    } = this.state;

    if (!isConnecting && bridges.length === 0 && !isConnected) {
      return (
        <button className="btn btn-connect" onClick={() => this.findBridge()}>
          {isLooking ? "Scanning your network..." : "Find my Bridge"}
        </button>
      );
    }

    if (bridges.length > 0 && !selectedBridge) {
      return (
        <div>
          <p>Please select your bridge to connect:</p>
          <ul>
            {bridges.map(bridge => (
              <li
                onClick={() => {
                  this.connectToBridge(bridge.ip);
                }}
                key={bridge.ip}
              >
                {bridge.ip}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (isConnecting) {
      return (
        <div>
          <p>Press the Push-Link button on the Bridge.</p>
        </div>
      );
    }

    if (isConnected && lights.length === 0) {
      return <p>Loading your lights...</p>;
    }

    if (isConnected) {
      return (
        <div>
          <p>Welcome back!</p>

          <div className="lights-wrapper">
            {lights.map(({ attributes }, lightIndex) => {
              const lightId = attributes.attributes.id;
              const elementIdentifier = `light-${lightId}`;
              return (
                <div className="light" key={attributes.attributes.uniqueid}>
                  <label htmlFor={elementIdentifier}>
                    <input
                      type="color"
                      id={elementIdentifier}
                      value={this.state.currentColor}
                      onChange={e => {
                        const color = e.target.value;
                        this.updateColor(color, lightIndex);
                      }}
                    />
                    <span
                      className="light-preview"
                      style={{
                        backgroundColor: this.state.lights[lightIndex]
                          .currentColor,
                      }}
                    />
                    <span className="light-name">
                      {attributes.attributes.name}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>

          <span
            onClick={e => {
              this.extractScreenColors();
            }}
            className="get-screen-colors"
          >
            {isWatching ? "Stop screen record" : "Get screen colors"}
          </span>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <div className="top-bar" />
        <div className="vertical-wrapper">
          <h1 className="title">Hue Desktop</h1>

          <div className="connect-wrapper">{this.renderConnectionWizard()}</div>
        </div>

        <style jsx global>{`
          body {
            margin: 0;
            text-align: center;
            font-family: "Calibre";
          }

          p {
            font-size: 22px;
          }

          .get-screen-colors {
            position: absolute;
            bottom: 15px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            cursor: pointer;
          }

          input[type="color"] {
            visibility: hidden;
            width: 50px;
            height: 50px;
            position: absolute;
            top: 0;
          }

          .light {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            justify-content: space-between;
            align-content: center;
            align-items: center;
            width: 33.333%;
            text-align: center;
            position: relative;
          }

          .lights-wrapper {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-between;
            align-content: center;
            align-items: center;
            width: 80%;
            margin: 60px auto 0;
          }

          .light-preview {
            padding: 0;
            border: 0;
            width: 50px;
            outline: 0;
            -webkit-appearance: none;
            height: 50px;
            background: none;
            display: inline-block;
            border-radius: 50%;
            border: 1px solid black;
            cursor: pointer;
          }

          .light-name {
            font-weight: 100;
            font-size: 12px;
            margin-top: 5px;
            display: block;
          }

          ul {
            list-style: none;
            margin: 0;
            padding: 0;
          }

          li {
            padding: 0;
            margin: 0;
            font-size: 22px;
            font-family: "Courier New";
            color: #848484;
            transition: color 200ms ease-in-out;
            cursor: pointer;
          }

          li:hover {
            color: #4c4747;
          }

          .vertical-wrapper {
            height: calc(100vh - 100px);
          }

          .top-bar {
            background: white;
            height: 35px;
            -webkit-user-select: none;
            -webkit-app-region: drag;
          }

          .btn.btn-connect {
            display: inline-block;
            max-width: 100%;
            min-width: 180px;
            padding: 0 20px;
            border: 0;
            border-radius: 4px;
            background-color: #0095ff;
            color: #fff;
            font-size: 18px;
            font-size: 16px;
            font-weight: 400;
            line-height: 44px;
            line-height: 38px;
            text-align: center;
            text-decoration: none;
            outline: none;
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-transition: background 0.15s;
            transition: background 0.15s;
            white-space: nowrap;
          }

          .title {
            text-align: center;
            display: block;
            width: 100%;
            margin: 60px 0;
          }
        `}</style>
      </div>
    );
  }
}
