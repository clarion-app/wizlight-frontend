import { useEffect, useState } from "react";
import { BulbStateType } from "./types";
import Wheel from "@uiw/react-color-wheel";
import { hexToHsva } from "@uiw/color-convert";
import { useSetBulbMutation, useDeleteBulbMutation } from "./wizlightApi";
import { TemperatureSlide } from "./TemperatureSlide";

interface BulbPropsType extends BulbStateType {}

type BulbColorType = "Temperature" | "RGB";

const Bulb = (props: BulbPropsType) => {
  const [setBulb, { isLoading, isSuccess, isError }] = useSetBulbMutation();
  const [deleteBulb] = useDeleteBulbMutation();

  const { id, dimming, state, last_seen } = props;
  const [temperature, setTemperature] = useState<number>(
    props.temperature || 2700
  );
  const [red, setRed] = useState<number>(props.red || 0);
  const [green, setGreen] = useState<number>(props.green || 0);
  const [blue, setBlue] = useState<number>(props.blue || 0);

  const [colorType, setColorType] = useState<BulbColorType>(
    !red && !green && !blue ? "Temperature" : "RGB"
  );
  const [name, setName] = useState<string>(props.name || "");
  const [editName, setEditName] = useState<boolean>(false);

  const hexValue = `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

  const [hexColor, setHexColor] = useState<string>(hexValue);

  const seconds_ago = Math.floor(
    (new Date().getTime() - new Date(last_seen.last_seen_at).getTime()) / 1000
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
  if (dimming < 100) {
    bright = dimming / 100;
    if (bright < 0.1) {
      bright = 0.1;
    }
  }

  if (props.state === 0) {
    bright = 0.05;
  }

  useEffect(() => {
    if (colorType === "Temperature") {
      changeTemperature(temperature);
    }
  }, [temperature]);

  const changeTemperature = (temperature: number) => {
    const newColor = {
      ...props,
      temperature: temperature,
      dimming: dimming,
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
      ...props,
      red: parseInt(red, 16),
      green: parseInt(green, 16),
      blue: parseInt(blue, 16),
      dimming: dimming,
      temperature: 0,
    };

    setBulb(newColor);
  };

  const changeName = () => {
    setBulb({ ...props, name: name });
    setEditName(false);
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
    <div className="has-background-light fixed-grid">
      <div className="grid">
        {colorType}
        <div className="cell">
          <button onClick={() => switchRGBxTemp()}>
            Switch to {colorType === "RGB" ? "Temperature" : "RGB"}
          </button>
        </div>
        <div className="cell">
          <button onClick={() => deleteBulb(id)}>Delete</button>
        </div>
      </div>
      <div className="grid">
        <div className="cell">
          {colorType === "RGB" ? (
            <Wheel
              color={hexToHsva(hexColor)}
              onChange={(color) => {
                setHexColor(color.hex);
                changeColor(color.hex);
              }}
              width={100}
              height={100}
            />
          ) : (
            <TemperatureSlide
              temperature={temperature!}
              setTemperature={setTemperature}
            />
          )}
        </div>
        <div className="cell">
          <input
            type="text"
            value={colorType === "RGB" ? hexColor : temperature}
            readOnly
          />
          {editName ? (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <button onClick={() => changeName()} className="button">
                Save
              </button>
            </>
          ) : (
            <>
              <h2>{name}</h2>
              <h3>Last seen {last_seen_ago}</h3>
              <button onClick={() => setEditName(true)} className="button">
                Edit
              </button>
            </>
          )}
          <button
            onClick={() => setBulb({ ...props, state: state ? 0 : 1 })}
            className="button"
          >
            Turn {state ? "off" : "on"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bulb;
