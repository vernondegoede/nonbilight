import { Component } from "react";

import ColorsPreview from "./ColorsPreview";
import { theaterModeStyles } from "./../styles/components/TheaterMode";

class TheaterMode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      colors: [],
      client: null,
    };

    this.watchScreenInterval = null;
  }

  componentWillReceiveProps({ client }) {
    // Wait until bridge is connected and lights found
    if (!this.state.client && client) {
      this.setState(
        {
          client,
        },
        () => {
          this.initScreenObserver();
        },
      );
    }
  }

  componentWillUnmount() {
    if (this.watchScreenInterval) {
      clearInterval(this.watchScreenInterval);
    }
  }

  initScreenObserver() {
    const screenshot = this.props.remote.require("desktop-screenshot");
    const getColors = this.props.remote.require("./utils/getImageColors");
    const app = this.props.remote.app;
    const pathName = app.getPath("temp") + "screenshot.png";

    const readScreenColors = async () => {
      if (!this.state.client) {
        return false;
      }

      try {
        const colors = await getColors(pathName);
        this.props.switchMultipleLights(colors);
      } catch (err) {
        console.log("Something weird happened 🤔", err);
      } finally {
        readScreenColors();
      }
    };

    this.watchScreenInterval = setInterval(() => {
      screenshot(pathName, {});
    }, 500);
  }

  getEncodedScreenshot() {
    let absoluteScreenshotPath;

    if (this.props.remote) {
      const fs = this.props.remote.require("fs");
      absoluteScreenshotPath =
        this.props.remote.app.getPath("temp") + "screenshot.png";
      const bitmap = fs.readFileSync(absoluteScreenshotPath);
      return new Buffer(bitmap).toString("base64");
    }

    return false;
  }

  render() {
    const { colors } = this.props;
    const lastScreenshot = this.getEncodedScreenshot();

    return (
      <div>
        {lastScreenshot && (
          <img
            className="screenshot"
            src={"data:image/png;base64," + lastScreenshot}
          />
        )}
        <ColorsPreview colors={colors} />
        <style jsx>{theaterModeStyles}</style>
      </div>
    );
  }
}

export default TheaterMode;
