import './LightBulb.css';
import { BulbStateType } from './types';

interface BulbPropsType extends BulbStateType {
}

const Bulb = (props: BulbPropsType) => {
    const { red, green, blue, dimming } = props;

    const color = `rgba(${red}, ${green}, ${blue}, ${(dimming / 50).toFixed(2)})`;

    const bulbStyle = {
      backgroundColor: color,
    };
  
    return (
      <div className="light-bulb">
        <div className="bulb" style={bulbStyle}></div>
        <div className="base"></div>
      </div>
    );
  };

export default Bulb;
