import { useEffect, useState } from "react";
import Bulb from "./Bulb";
import getState from "./getState";
import setState from "./setState";
import { BulbStateType } from "./types";

const Bulbs = () => {
  const [bulbs, setBulbs] = useState<BulbStateType[]>([]);

  const updateState = () => {
    getState(null).then((results) => {
      setBulbs(results);
    });
  };

  useEffect(() => {
    updateState();
    const interval = setInterval(() => {
      updateState();
    }, 10000);
    return () => clearInterval(interval);
  }, [setBulbs]);
  
  const toggleBulb = (id: string) => {
    const newBulbs = bulbs.map((bulb) => {
      if (bulb.id === id) {
        const newState = bulb.state ? 0 : 1;
        setState(id, { ...bulb, state: newState });
        return {
          ...bulb,
          state: newState,
        };
      }
      return bulb;
    });
    setBulbs(newBulbs);
  }

  return <div>
    <h2>List of bulbs</h2>
    {bulbs.map((bulb) => (
      <div key={bulb.id}>
        <Bulb {...bulb} />
      </div>
    ))}
  </div>;
};

export default Bulbs;
