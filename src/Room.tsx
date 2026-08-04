import { useParams } from "react-router-dom";
import {
  useDeleteRoomMutation,
  useGetBulbsQuery,
  useGetRoomsQuery,
  useSetBulbMutation,
  useSetRoomMutation,
} from "./wizlightApi";
import { BulbStateType, RoomType } from "./types";
import Bulb from "./Bulb";
import Wheel from "@uiw/react-color-wheel";
import { hexToHsva } from "@uiw/color-convert";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TemperatureSlide } from "./TemperatureSlide";
import { WindowWS } from "@clarion-app/types";

type RoomColorType = "Temperature" | "RGB";

const Room = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const {
    data: rooms,
    error: roomsError,
    isLoading: roomsLoading,
    isSuccess: roomsSuccess,
    isError: roomsIsError,
    refetch: refetchRooms,
  } = useGetRoomsQuery(null);
  const {
    data: bulbs,
    error: bulbsError,
    isLoading: bulbsLoading,
    isSuccess: bulbsSuccess,
    isError: bulbsIsError,
    refetch: refetchBulbs,
  } = useGetBulbsQuery(null);
  const [
    setBulb,
    {
      isLoading: setBulbIsLoading,
      isSuccess: setBulbIsSuccess,
      isError: setBulbIsError,
    },
  ] = useSetBulbMutation();
  const [setRoom] = useSetRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const room: RoomType = rooms?.find((room: RoomType) => room.name === name);

  const [roomState, setRoomState] = useState(room?.state || 0);

  // Room color state
  const [red, setRed] = useState(room?.red || 0);
  const [green, setGreen] = useState(room?.green || 0);
  const [blue, setBlue] = useState(room?.blue || 0);
  const [temperature, setTemperature] = useState(room?.temperature || 2700);
  const [dimming, setDimming] = useState(room?.dimming || 100);
  const [editName, setEditName] = useState(false);
  const [roomName, setRoomName] = useState(room?.name || "");

  const [colorType, setColorType] = useState<RoomColorType>(
    !red && !green && !blue ? "Temperature" : "RGB"
  );

  // Hex color for Wheel
  const hexValue = `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
  const [hexColor, setHexColor] = useState(hexValue);
  const [hexInputText, setHexInputText] = useState(hexValue);
  const wheelColor = hexToHsva(hexColor);
  wheelColor.v = 100;

  // Keep the text field in sync with the applied color, but only once it's a valid hex
  React.useEffect(() => {
    setHexInputText(hexColor);
  }, [hexColor]);

  useEffect(() => {
    if (room) {
      setRed(room.red || 0);
      setGreen(room.green || 0);
      setBlue(room.blue || 0);
      setTemperature(room.temperature || 2700);
      setDimming(room.dimming || 100);
      setRoomName(room.name || "");
      setHexColor(
        `#${(room.red || 0).toString(16).padStart(2, "0")}${(room.green || 0)
          .toString(16)
          .padStart(2, "0")}${(room.blue || 0).toString(16).padStart(2, "0")}`
      );
      setRoomState(room.state || 0);
      setColorType(!room.red && !room.green && !room.blue ? "Temperature" : "RGB");
    }
  }, [room]);

  const win = window as unknown as WindowWS;

  useEffect(() => {
    win.Echo.private("clarion-app-wizlights").listen(
      ".ClarionApp\\WizlightBackend\\Events\\BulbStatusEvent",
      (message: any) => {
        void refetchRooms();
        void refetchBulbs();
      }
    );
  }, []);

  if (roomsLoading || bulbsLoading) {
    return <div>Loading...</div>;
  }

  if (roomsIsError || bulbsIsError) {
    return <div>Error: {roomsError?.toString() || bulbsError?.toString()}</div>;
  }

  const roomBulbs = bulbs.filter((b: BulbStateType) => b.room_id === room.id);
  const unassignedBulbs = bulbs.filter(
    (b: BulbStateType) => b.room_id === null
  );

  const handleAssign = (bulb: BulbStateType) => {
    setBulb({ ...bulb, room_id: room.id });
  };

  const handleRoomColorChange = (color: any) => {
    let r = parseInt(color.hex.slice(1, 3), 16);
    let g = parseInt(color.hex.slice(3, 5), 16);
    let b = parseInt(color.hex.slice(5, 7), 16);
    // Normalize to full value so the wheel stays vivid; actual light output is the Brightness slider's job
    const max = Math.max(r, g, b);
    if (max > 0 && max < 255) {
      const scale = 255 / max;
      r = Math.round(r * scale);
      g = Math.round(g * scale);
      b = Math.round(b * scale);
    }
    const normalizedHex = `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    setHexColor(normalizedHex);
    setRed(r);
    setGreen(g);
    setBlue(b);
    if (room) {
      const newValue = {
        ...room,
        name: roomName,
        red: r,
        green: g,
        blue: b,
        temperature: 0,
        dimming,
        state: roomState,
      };
      setRoom({
        id: room.id,
        state: newValue,
      });
    }
  };

  const handleTemperatureChange = (temp: number) => {
    setTemperature(temp);
    if (room) {
      const newValue = {
        ...room,
        name: roomName,
        red: 0,
        green: 0,
        blue: 0,
        temperature: temp,
        dimming,
        state: roomState,
      };
      setRoom({
        id: room.id,
        state: newValue,
      });
    }
  };

  const switchRGBxTemp = () => {
    if (colorType === "RGB") {
      setColorType("Temperature");
      handleTemperatureChange(temperature);
    } else {
      setColorType("RGB");
      setRed(255);
      setGreen(255);
      setBlue(255);
      setHexColor("#FFFFFF");
      handleRoomColorChange({ hex: "#FFFFFF" });
    }
  };

  const handleDimmingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setDimming(value);
    if (room) {
      setRoom({
        id: room.id,
        state: {
          ...room,
          name: roomName,
          red,
          green,
          blue,
          dimming: value,
        },
      });
    }
  };

  const handleRoomSave = () => {
    if (!room) return;
    const newValue = {
      ...room,
      name: roomName,
      red,
      green,
      blue,
      dimming,
      state: roomState,
    };
    setRoom({ id: room.id, state: newValue });
    setEditName(false);
  };

  return (
    <div className="container">
      <div className="columns is-multiline">
        <div className="column is-full">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h1 className="title">🏠 {name}</h1>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <button
                  className="button is-danger is-outlined"
                  onClick={() => {
                    deleteRoom(room.id);
                    navigate("/clarion-app/wizlights/rooms");
                  }}
                >
                  🗑️ Delete Room
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="column is-full">
          <div className="card">
            <header className="card-header">
              <div className="card-header-title">
                <span className={`tag is-medium ${colorType === "RGB" ? "is-primary" : "is-warning"} mr-3`}>
                  {colorType}
                </span>
                <span className={`tag is-small ${roomState ? "is-success" : "is-light"} mr-2`}>
                  {roomState ? "🔆 ON" : "⭕ OFF"}
                </span>
                <span className="tag is-small is-info mr-3">
                  {dimming}%
                </span>
                <div className="buttons">
                  <button 
                    className={`button is-small ${colorType === "RGB" ? "is-warning" : "is-info"}`}
                    onClick={switchRGBxTemp}
                    title={`Switch to ${colorType === "RGB" ? "Temperature" : "RGB"} mode`}
                  >
                    {colorType === "RGB" ? "🌡️" : "🎨"} Switch to {colorType === "RGB" ? "Temperature" : "RGB"}
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
                          color={wheelColor}
                          onChange={handleRoomColorChange}
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
                                  handleRoomColorChange({ hex: value });
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
                    ) : (
                      <div className="temperature-container">
                        <TemperatureSlide
                          temperature={temperature}
                          setTemperature={handleTemperatureChange}
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
                    {editName ? (
                      <div className="field has-addons">
                        <div className="control is-expanded">
                          <input
                            className="input"
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            autoFocus
                            placeholder="Room name"
                          />
                        </div>
                        <div className="control">
                          <button onClick={handleRoomSave} className="button is-success">
                            ✅
                          </button>
                        </div>
                        <div className="control">
                          <button 
                            onClick={() => {
                              setEditName(false);
                              setRoomName(room?.name || "");
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
                          {roomName}
                          <button 
                            onClick={() => setEditName(true)} 
                            className="button is-small is-ghost ml-2"
                          >
                            ✏️
                          </button>
                        </h2>
                      </>
                    )}

                    <div className="field mt-4">
                      <label className="label">🔆 Brightness</label>
                      <div className="field has-addons">
                        <div className="control is-expanded">
                          <input
                            className="slider is-fullwidth"
                            type="range"
                            min={0}
                            max={100}
                            value={dimming}
                            onChange={handleDimmingChange}
                          />
                        </div>
                        <div className="control">
                          <span className="tag is-info is-medium">{dimming}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="field mt-4">
                      <div className="control">
                        <button
                          onClick={() => {
                            const newState = roomState ? 0 : 1;
                            setRoomState(newState);
                            if (room) {
                              setRoom({
                                id: room.id,
                                state: {
                                  ...room,
                                  name: roomName,
                                  red,
                                  green,
                                  blue,
                                  dimming,
                                  state: newState,
                                },
                              });
                            }
                          }}
                          className={`button is-large is-fullwidth ${
                            roomState ? "is-success" : "is-light"
                          }`}
                        >
                          {roomState ? "💡 Turn Off Room" : "🔌 Turn On Room"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="column is-full">
          <h2 className="title is-4">💡 Room Bulbs</h2>
          <div className="columns is-multiline">
            {roomBulbs.filter((bulb: BulbStateType) => bulb.id).map((bulb: BulbStateType) => (
              <div key={bulb.id} className="column is-one-third">
                <Bulb id={bulb.id!} />
              </div>
            ))}
          </div>
        </div>

        {unassignedBulbs.length > 0 && (
          <div className="column is-full">
            <div className="card">
              <header className="card-header">
                <div className="card-header-title">
                  <span className="tag is-medium is-warning mr-3">🔌 Unassigned Bulbs</span>
                </div>
              </header>
              <div className="card-content">
                <div className="columns is-multiline">
                  {unassignedBulbs.map((bulb: BulbStateType) => (
                    <div key={bulb.id} className="column is-half">
                      <div className="box">
                        <div className="level">
                          <div className="level-left">
                            <div className="level-item">
                              <span className="title is-6">💡 {bulb.name}</span>
                            </div>
                          </div>
                          <div className="level-right">
                            <div className="level-item">
                              <button 
                                onClick={() => handleAssign(bulb)}
                                className="button is-primary is-small"
                              >
                                ➕ Assign to {name}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
