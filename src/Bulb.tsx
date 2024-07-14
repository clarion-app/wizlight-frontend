import { useState } from "react";
import { BulbStateType } from "./types";
import Wheel from "@uiw/react-color-wheel";
import { hexToHsva } from "@uiw/color-convert";
import { useSetBulbMutation } from "./wizlightApi";

interface BulbPropsType extends BulbStateType {}

const Bulb = (props: BulbPropsType) => {
  const [setBulb, { isLoading, isSuccess, isError }] = useSetBulbMutation();

  const { id, red, green, blue, dimming, temperature, state } = props;
  const [name, setName] = useState<string>(props.name || "");
  const [editName, setEditName] = useState<boolean>(false);

  const hexValue = `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

  const [hexColor, setHexColor] = useState<string>(hexValue);

  console.log(props);

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
    };
    delete newColor.temperature;

    setBulb({ id: id, state: newColor });
  };

  const changeName = () => {
    setBulb({ id: id, state: { ...props, name: name } });
    setEditName(false);
  };

  return (
    <div className="has-background-light fixed-grid">
      <div className="grid">
        <div className="cell">
          <Wheel
            color={hexToHsva(hexColor)}
            onChange={(color) => {
              setHexColor(color.hex);
              changeColor(color.hex);
            }}
            width={100}
            height={100}
          />
        </div>
        <div className="cell">
          <input type="text" value={hexColor} readOnly />
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
              <button onClick={() => setEditName(true)} className="button">
                Edit
              </button>
            </>
          )}
          <button onClick={() => setBulb({ id, state: { ...props, state: state ? 0 : 1 } })} className="button">
              Turn {state ? "off" : "on"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bulb;
