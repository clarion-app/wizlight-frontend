import { useEffect, useState } from "react";
import { BulbStateType } from "./types";
import Wheel from "@uiw/react-color-wheel";
import { hexToHsva } from "@uiw/color-convert";
import {
  useGetBulbsQuery,
  useSetBulbMutation,
  useDeleteBulbMutation,
} from "./wizlightApi";
import { TemperatureSlide } from "./TemperatureSlide";
import { WindowWS } from "@clarion-app/types";

interface BulbPropsType extends BulbStateType {}

type BulbColorType = "Temperature" | "RGB";

const Bulb = ({ id }: { id: string }) => {
  const {
    data: bulbs,
    isLoading: isLoadingBulbs,
    refetch,
  } = useGetBulbsQuery(null);
  const bulb = bulbs?.find((bulb: BulbStateType) => bulb.id === id);
  const [setBulb, { isLoading, isSuccess, isError }] = useSetBulbMutation();
  const [deleteBulb] = useDeleteBulbMutation();

  const [temperature, setTemperature] = useState<number>(
    bulb.temperature || 2700
  );
  const [red, setRed] = useState<number>(bulb.red || 0);
  const [green, setGreen] = useState<number>(bulb.green || 0);
  const [blue, setBlue] = useState<number>(bulb.blue || 0);

  const [colorType, setColorType] = useState<BulbColorType>(
    !red && !green && !blue ? "Temperature" : "RGB"
  );
  const [name, setName] = useState<string>(bulb.name || "");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const hexValue = `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

  const [hexColor, setHexColor] = useState<string>(hexValue);

  const tzOffset = new Date().getTimezoneOffset() * 60000; // in milliseconds

  const seconds_ago = Math.floor(
    ((new Date().getTime() - new Date(bulb.last_seen.last_seen_at).getTime()) + tzOffset) /
      1000
  );
  const last_seen_ago =
    seconds_ago < 60
      ? `${seconds_ago} seconds ago`
      : seconds_ago < 3600
      ? `${Math.floor(seconds_ago / 60)} minutes ago`
      : seconds_ago < 86400
      ? `${Math.floor(seconds_ago / 3600)} hours ago`
      : `${Math.floor(seconds_ago / 86400)} days ago`;

  let bright = 1.0;
  if (bulb.dimming < 100) {
    bright = bulb.dimming / 100;
    if (bright < 0.1) {
      bright = 0.1;
    }
  }

  if (bulb.state === 0) {
    bright = 0.05;
  }

  const win = window as unknown as WindowWS;

  useEffect(() => {
    win.Echo.channel("clarion-app-wizlights").listen(
      ".ClarionApp\\WizlightBackend\\Events\\BulbStatusEvent",
      (message: any) => {
        if (message.bulb.id !== id) {
          return;
        }
        console.log("BulbStatusEvent", message.bulb.name, message.bulb.state);
        setName(message.bulb.name);
        setTemperature(message.bulb.temperature);
        setRed(message.bulb.red);
        setGreen(message.bulb.green);
        setBlue(message.bulb.blue);
        setHexColor(
          `#${message.bulb.red
            .toString(16)
            .padStart(2, "0")}${message.bulb.green
            .toString(16)
            .padStart(2, "0")}${message.bulb.blue
            .toString(16)
            .padStart(2, "0")}`
        );
      }
    );
  }, []);

  /*
  useEffect(() => {
    if (colorType === "Temperature") {
      changeTemperature(temperature);
    }
  }, [temperature]);
  */

  const changeTemperature = (temperature: number) => {
    const newColor = {
      ...bulb,
      temperature: temperature,
      dimming: bulb.dimming,
      red: 0,
      green: 0,
      blue: 0,
    };

    setBulb(newColor);
  };

  const changeColor = (color: string) => {
    const red = color[1] + color[2];
    const green = color[3] + color[4];
    const blue = color[5] + color[6];

    let newColor = {
      ...bulb,
      red: parseInt(red, 16),
      green: parseInt(green, 16),
      blue: parseInt(blue, 16),
      dimming: bulb.dimming,
      temperature: 0,
    };

    setBulb(newColor);
  };

  const changeName = () => {
    setBulb({ ...bulb, name: name });
    setIsEditingName(false);
  };

  const switchRGBxTemp = () => {
    if (colorType === "RGB") {
      setColorType("Temperature");
      changeTemperature(temperature);
    } else {
      setColorType("RGB");
      changeColor("#FFFFFF");
      setRed(255);
      setGreen(255);
      setBlue(255);
    }
  };

  return (
    <div className="card">
      <header className="card-header">
        <div className="card-header-title">
          <span className={`tag is-medium ${colorType === "RGB" ? "is-primary" : "is-warning"} mr-3`}>
            {colorType}
          </span>
          <span className={`tag is-small ${bulb.state ? "is-success" : "is-light"} mr-2`}>
            {bulb.state ? "🔆 ON" : "⭕ OFF"}
          </span>
          <span className="tag is-small is-info mr-3">
            {bulb.dimming}%
          </span>
          <div className="buttons">
            <button 
              className={`button is-small ${colorType === "RGB" ? "is-warning" : "is-info"}`}
              onClick={() => switchRGBxTemp()}
              title={`Switch to ${colorType === "RGB" ? "Temperature" : "RGB"} mode`}
            >
              {colorType === "RGB" ? "🌡️" : "🎨"} Switch to {colorType === "RGB" ? "Temperature" : "RGB"}
            </button>
            <button 
              className="button is-small is-danger is-outlined" 
              onClick={() => deleteBulb(id)}
              title="Delete this bulb"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </header>

      <div className="card-content">
        <div className="columns">
          <div className="column is-one-third">
            <div className="has-text-centered mb-4">
              {colorType === "RGB" ? (
                <div className="color-wheel-container">
                  <Wheel
                    color={hexToHsva(hexColor)}
                    onChange={(color) => {
                      setHexColor(color.hex);
                      changeColor(color.hex);
                    }}
                    width={150}
                    height={150}
                  />
                  <div className="field mt-3">
                    <div className="control">
                      <input
                        className="input is-small has-text-centered"
                        type="text"
                        value={hexColor}
                        readOnly
                        style={{ 
                          backgroundColor: hexColor,
                          color: red + green + blue > 384 ? '#000' : '#fff',
                          border: `2px solid ${red + green + blue > 384 ? '#000' : '#fff'}`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="temperature-container">
                  <TemperatureSlide
                    temperature={temperature!}
                    setTemperature={setTemperature}
                  />
                  <div className="field mt-3">
                    <div className="control">
                      <input
                        className="input is-small has-text-centered"
                        type="text"
                        value={`${temperature}K`}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="column">
            <div className="content">
              {isEditingName ? (
                <div className="field has-addons">
                  <div className="control is-expanded">
                    <input
                      className="input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                      placeholder="Bulb name"
                    />
                  </div>
                  <div className="control">
                    <button onClick={() => changeName()} className="button is-success">
                      ✅
                    </button>
                  </div>
                  <div className="control">
                    <button 
                      onClick={() => {
                        setIsEditingName(false);
                        setName(bulb.name || "");
                      }} 
                      className="button is-light"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="title is-4 mb-2">
                    {name}
                    <button 
                      onClick={() => setIsEditingName(true)} 
                      className="button is-small is-ghost ml-2"
                    >
                      ✏️
                    </button>
                  </h2>
                  <p className="subtitle is-6 has-text-grey">
                    🕒 Last seen {last_seen_ago}
                  </p>
                </>
              )}

              <div className="field mt-4">
                <div className="control">
                  <button
                    onClick={() => setBulb({ ...bulb, state: bulb.state ? 0 : 1 })}
                    className={`button is-large is-fullwidth ${
                      bulb.state ? "is-success" : "is-light"
                    }`}
                    disabled={isLoading}
                  >
                    {bulb.state ? "💡 Turn Off" : "🔌 Turn On"}
                  </button>
                </div>
              </div>

              {isLoading && (
                <div className="notification is-info is-light mt-3">
                  ⏳ Updating bulb...
                </div>
              )}

              {isError && (
                <div className="notification is-danger is-light mt-3">
                  ⚠️ Failed to update bulb
                </div>
              )}

              {isSuccess && (
                <div className="notification is-success is-light mt-3">
                  ✅ Bulb updated successfully
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bulb;