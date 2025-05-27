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
  const [editName, setEditName] = useState<boolean>(false);

  const hexValue = `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

  const [hexColor, setHexColor] = useState<string>(hexValue);

  const seconds_ago = Math.floor(
    (new Date().getTime() - new Date(bulb.last_seen.last_seen_at).getTime()) /
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
            onClick={() => setBulb({ ...bulb, state: bulb.state ? 0 : 1 })}
            className="button"
          >
            Turn {bulb.state ? "off" : "on"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bulb;