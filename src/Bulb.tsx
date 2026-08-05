import { useEffect, useState } from "react";
import { BulbStateType } from "./types";
import Wheel from "@uiw/react-color-wheel";
import { hexToHsva } from "@uiw/color-convert";
import {
  useGetBulbsQuery,
  useSetBulbMutation,
  useDeleteBulbMutation,
  useGetScenesQuery,
} from "./wizlightApi";
import { TemperatureSlide } from "./TemperatureSlide";
import ScenePicker from "./ScenePicker";
import { resolveSceneName } from "./scenes";
import { WindowWS } from "@clarion-app/types";
import {
  WIZLIGHT_CHANNEL,
  BULB_STATUS_EVENT,
  BULB_COMMAND_FAILED_EVENT,
} from "./channels";

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
  const [commandFailed, setCommandFailed] = useState<boolean>(false);

  const { data: scenes } = useGetScenesQuery();

  // FR-004b: listen for command failure events and revert optimistic state
  useEffect(() => {
    const channel = win.Echo.private(WIZLIGHT_CHANNEL);
    const onCommandFailed = (message: any) => {
        if (message.bulbId !== id) {
          return;
        }
        // Revert to last-known actual state from the event payload
        const ls = message.lastKnownState;
        if (ls) {
          setTemperature(ls.temperature ?? 2700);
          setRed(ls.red ?? 0);
          setGreen(ls.green ?? 0);
          setBlue(ls.blue ?? 0);
          setHexColor(
            `#${(ls.red ?? 0).toString(16).padStart(2, "0")}${(ls.green ?? 0)
              .toString(16)
              .padStart(2, "0")}${(ls.blue ?? 0).toString(16).padStart(2, "0")}`
          );
        }
        setCommandFailed(true);
        // Clear the error indicator after 5 seconds
        setTimeout(() => setCommandFailed(false), 5000);
    };

    channel.listen(BULB_COMMAND_FAILED_EVENT, onCommandFailed);

    // Echo channels expose stopListening(event, callback) — there is no stop().
    // The callback argument is required, not optional politeness: every Bulb and
    // every Room shares this one channel, so a bare stopListening(event) would
    // tear down the other components' listeners too.
    return () => {
      channel.stopListening(BULB_COMMAND_FAILED_EVENT, onCommandFailed);
    };
  }, [id]);

  const hexValue = `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

  const [hexColor, setHexColor] = useState<string>(hexValue);
  const [hexInputText, setHexInputText] = useState<string>(hexValue);

  // Keep the text field in sync with the applied color, but only once it's a valid hex
  useEffect(() => {
    setHexInputText(hexColor);
  }, [hexColor]);

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
    const channel = win.Echo.private(WIZLIGHT_CHANNEL);
    const onStatus = (message: any) => {
        if (message.bulb.id !== id) {
          return;
        }
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
        // Clear any pending command-failed state when we get a fresh status update
        setCommandFailed(false);
    };

    channel.listen(BULB_STATUS_EVENT, onStatus);

    return () => {
      channel.stopListening(BULB_STATUS_EVENT, onStatus);
    };
  }, [id]);

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
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    setRed(r);
    setGreen(g);
    setBlue(b);
    setHexColor(color.toLowerCase());

    let newColor = {
      ...bulb,
      red: r,
      green: g,
      blue: b,
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
      changeColor("#ffffff");
    }
  };

  // Only render the controls this device actually supports. A `capability_class`
  // of `null` (not yet probed) falls through both gates and renders like
  // dim_only — brightness stays available unconditionally either way.
  const showColourWheel = bulb.capability_class === "full_colour";
  const showWarmthSlider =
    bulb.capability_class === "full_colour" ||
    bulb.capability_class === "tunable_white";

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
            {showColourWheel && showWarmthSlider && (
              <button
                className={`button is-small ${colorType === "RGB" ? "is-warning" : "is-info"}`}
                onClick={() => switchRGBxTemp()}
                title={`Switch to ${colorType === "RGB" ? "Temperature" : "RGB"} mode`}
              >
                {colorType === "RGB" ? "🌡️" : "🎨"} Switch to {colorType === "RGB" ? "Temperature" : "RGB"}
              </button>
            )}
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
          {(showColourWheel || showWarmthSlider) && (
            <div className="column is-one-third">
              <div className="has-text-centered mb-4">
                {showColourWheel && (
                  <div className="color-wheel-container">
                    <Wheel
                      color={hexToHsva(hexColor)}
                      onChange={(color) => changeColor(color.hex)}
                      width={150}
                      height={150}
                    />
                    <div className="field mt-3">
                      <div className="control">
                        <input
                          className="input is-small has-text-centered"
                          type="text"
                          value={hexInputText}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (value && !value.startsWith("#")) {
                              value = `#${value}`;
                            }
                            setHexInputText(value);
                            if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                              changeColor(value);
                            }
                          }}
                          onBlur={() => {
                            if (!/^#[0-9a-fA-F]{6}$/.test(hexInputText)) {
                              setHexInputText(hexColor);
                            }
                          }}
                          maxLength={7}
                          style={{
                            backgroundColor: hexColor,
                            color: red + green + blue > 384 ? '#000' : '#fff',
                            border: `2px solid ${red + green + blue > 384 ? '#000' : '#fff'}`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {showWarmthSlider && (
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
          )}

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
                  {bulb.active_mode === 'scene' && bulb.scene_id && (
                    <p className="subtitle is-6 has-text-info mt-1">
                      🎬 {resolveSceneName(bulb.scene_id, scenes ?? [])}
                    </p>
                  )}
                </>
              )}

              <div className="field mt-4">
                <ScenePicker
                  capabilityClass={bulb.capability_class}
                  currentSceneId={bulb.scene_id}
                  onChange={(sceneId) => {
                    setBulb({
                      ...bulb,
                      active_mode: 'scene',
                      scene_id: sceneId,
                      scene_speed: null,
                    });
                  }}
                />
              </div>
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

              {commandFailed && (
                <div className="notification is-danger is-light mt-3">
                  ⚠️ Command failed — reverted to last known state
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
