import { useState } from "react";

export const TemperatureSlide = (props: { temperature: number, setTemperature: Function }) => {
    const [temp, setTemp] = useState(props.temperature);
  
    return (
      <div>
        <input
          type="range"
          min="2000"
          max="6500"
          value={props.temperature}
          onChange={(e) => {
            setTemp(parseInt(e.target.value));
          }}
          onMouseUp={(e) => {
            props.setTemperature(temp);
          }}
        />
      </div>
    );
  };