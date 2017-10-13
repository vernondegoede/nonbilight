import { Component } from "react";
import { HuePicker } from "react-color";

export default class ManualMode extends Component {
  render() {
    return (
      <div>
        <HuePicker
          className="color-picker"
          color={this.props.color}
          onChangeComplete={color => {
            this.props.switchMultipleLights({
              _rgb: [color.rgb.r, color.rgb.g, color.rgb.b],
              rgb: () => [color.rgb.r, color.rgb.g, color.rgb.b],
            });
          }}
          style={{
            cover: {
              position: "fixed",
              top: "0px",
              right: "0px",
              bottom: "0px",
              left: "0px",
            },
          }}
        />
      </div>
    );
  }
}
