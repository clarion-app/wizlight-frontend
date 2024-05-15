import { useState } from 'react';
import './LightBulb.css';

interface BulbPropsType {
    color: string;
    brightness: number; // from 0 to 100
}

const Bulb = (props: BulbPropsType) => {
    const [isOn, setIsOn] = useState(false);
    const { color, brightness } = props;

    const bulbStyle = {
      backgroundColor: isOn ? color : 'gray',
      opacity: brightness / 100,
    };
  
    return (
      <div className="light-bulb" onClick={() => setIsOn(!isOn)}>
        <div className="bulb" style={bulbStyle}></div>
        <div className="base"></div>
      </div>
    );
  };

export default Bulb;
