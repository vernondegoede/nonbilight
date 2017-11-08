import { Component } from "react";

import ColorsPreview from "./ColorsPreview";
import { theaterModeStyles } from "./../styles/components/TheaterMode";

class TheaterMode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: [],
      client: null,
    };

    this.watchScreenInterval = null;
  }

  componentWillReceiveProps({ client }) {
    // Wait until bridge is connected and lights found
    if (!this.state.client && client && !this.watchScreenInterval) {
      this.startListeners(client);
    }
  }

  componentWillUnmount() {
    if (this.watchScreenInterval) {
      clearInterval(this.watchScreenInterval);
      this.watchScreenInterval = null;
    }
  }

  startListeners(client) {
    this.setState(
      {
        client,
      },
      () => {
        this.initScreenObserver();
      },
    );
  }

  componentDidMount() {
    if (this.props.client && !this.watchScreenInterval) {
      this.startListeners(this.props.client);
    }
  }

  initScreenObserver() {
    const screenshot = this.props.remote.require("desktop-screenshot");
    const getColors = this.props.remote.require("./getImageColors");
    const app = this.props.remote.app;
    const pathName = app.getPath("temp") + "screenshot.png";

    const readScreenColors = async () => {
      if (!this.state.client || !this.watchScreenInterval) {
        return false;
      }

      try {
        const { color, brightness } = await getColors(pathName);
        this.props.switchMultipleLights(color, brightness);
      } catch (err) {
        console.log("Something weird happened 🤔", err);
      } finally {
        readScreenColors();
      }
    };

    const takeScreenshot = async () => {
      this.watchScreenInterval = true;
      screenshot(pathName, {}, (error, complete) => {
        if (complete) {
          setTimeout(() => takeScreenshot(), 100);
        }
      });
    };

    takeScreenshot();
    readScreenColors();
  }

  getEncodedScreenshot() {
    let absoluteScreenshotPath;

    try {
      if (this.props.remote) {
        const fs = this.props.remote.require("fs");
        absoluteScreenshotPath =
          this.props.remote.app.getPath("temp") + "screenshot.png";
        const bitmap = fs.readFileSync(absoluteScreenshotPath);
        return new Buffer(bitmap).toString("base64");
      }
    } catch (error) {
      console.error("Could not read screenshot.", error);
    }

    return false;
  }

  render() {
    const { color } = this.props;
    const lastScreenshot = this.getEncodedScreenshot();

    return (
      <div>
        {lastScreenshot && (
          <img
            className="screenshot"
            src={"data:image/png;base64," + lastScreenshot}
          />
        )}
        <ColorsPreview color={color} />
        <style jsx>{theaterModeStyles}</style>
      </div>
    );
  }
}

export default TheaterMode;
