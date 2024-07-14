import Bulb from "./Bulb";
import { BulbStateType } from "./types";
import { useEffect } from "react";
import { useGetBulbsQuery, useSetBulbMutation } from "./wizlightApi";
import { WindowWS } from "@clarion-app/types";

const Bulbs = () => {
  const [setBulb, { isLoading, isSuccess, isError }] = useSetBulbMutation();
  const bulbsQuery = useGetBulbsQuery(null);
  const bulbs = bulbsQuery.data ?? [];

  const toggleBulb = (id: string) => {
    const newBulbs = bulbs.map((bulb: BulbStateType) => {
      if (bulb.id === id) {
        const newState = bulb.state ? 0 : 1;
        setBulb({ id, state: { ...bulb, state: newState } }).then(() => {
          //refresh the bulbs
          bulbsQuery.refetch();
        });
        return {
          ...bulb,
          state: newState,
        };
      }
      return bulb;
    });
  };

  useEffect(() => {
    const win = window as unknown as WindowWS;
    if(win.Echo) {
      win.Echo.channel('clarion-apps-wizlight').listen('.ClarionApp\\WizlightBackend\\Events\\BulbStatusEvent', (event: any) => {
        console.log('bulb status event', event);
        bulbsQuery.refetch();
    });
    }
  }, []);

  return (
    <section className="section fixed-grid has-1-cols">
      <h1 className="title">Wizlight - Bulbs</h1>
      {bulbs.map((bulb: BulbStateType) => (
        <div key={bulb.id} className="grid">
          <div className="cell">
            <Bulb {...bulb} />
            
          </div>
        </div>
      ))}
    </section>
  );
};

export default Bulbs;
