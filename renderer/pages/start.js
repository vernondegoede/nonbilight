const ipcRenderer = require("electron").ipcRenderer;

import { Component } from "react";

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      colors: [],
    };
  }

  componentDidMount() {
    ipcRenderer.on("set-screen-colors", (event, colors) => {
      this.setState({
        colors,
      });
    });
  }

  getColor(rgbValues) {
    return rgbValues.join(",");
  }

  render() {
    const { colors } = this.state;
    console.log("colors", colors);

    return (
      <div>
        <span>Get dominant screen color</span>

        {colors.length > 0 &&
          colors.map(color => (
            <div
              style={{
                width: "100%",
                height: "60px",
                backgroundColor: `rgba(${this.getColor(color._rgb)})`,
              }}
            />
          ))}

        <button onClick={() => ipcRenderer.send("get-screen-colors")}>
          Get screen colors
        </button>
      </div>
    );
  }
}
