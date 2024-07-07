import { useState } from 'react';
import './LightBulb.css';
import { BulbStateType } from './types';
import ColorWheel from './ColorWheel';
import { useSetBulbMutation } from './bulbApi';

interface BulbPropsType extends BulbStateType {
}

const Bulb = (props: BulbPropsType) => {
    const [setBulb, { isLoading, isSuccess, isError }] = useSetBulbMutation();

    const { id, red, green, blue, dimming, temperature } = props;
    const [name, setName] = useState<string>(props.name || '');

    let bright = 1.00;
    if (dimming < 100) {
      bright = dimming / 100;
      if (bright < 0.1) {
        bright = 0.1;
      }
    }

    if(props.state === 0) {
      bright = 0.05;
    }

    const color = `rgba(${red}, ${green}, ${blue}, ${bright})`;

    const clamp= (x: number, min: number, max: number) => {
      if (x < min) return min;
      if (x > max) return max;
      return x;
    };

    const colorTemperatureToRGB = (kelvin: number) => {
      let temperature = kelvin / 100;
      let red, green, blue;
    
      if (temperature <= 66) {
        red = 255;
        green = temperature;
        green = 99.4708025861 * Math.log(green) - 161.1195681661;
        if (temperature <= 19) {
          blue = 0;
        } else {
          blue = temperature - 10;
          blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
        }
      } else {
        red = temperature - 60;
        red = 329.698727446 * Math.pow(red, -0.1332047592);
        green = temperature - 60;
        green = 288.1221695283 * Math.pow(green, -0.0755148492);
        blue = 255;
      }
    
      const tempColor = {
        r: clamp(Math.round(red), 0, 255),
        g: clamp(Math.round(green), 0, 255),
        b: clamp(Math.round(blue), 0, 255)
      };

      return 'rgb(' + tempColor.r + ',' + tempColor.g + ',' + tempColor.b + ')';
    }

    const bulbStyle = {
      backgroundColor: color,
      height: '250px'
    };
  
    if(red == 0 && green == 0 && blue == 0 && temperature !== undefined) {
      bulbStyle.backgroundColor = colorTemperatureToRGB(temperature);
      console.log('tempColor', colorTemperatureToRGB(temperature));
    } else {
      bulbStyle.backgroundColor = color;
      console.log('color', color);
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

    return (
      <div style={{ margin: '20px', backgroundColor: 'beige' }}>
        <div style={bulbStyle}>
          <ColorWheel changeColor={changeColor} />
        </div>
        <h2>{name}</h2>
      </div>
    );
  };

export default Bulb;
