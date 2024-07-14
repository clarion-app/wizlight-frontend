import Bulb from "./Bulb";
import { BulbStateType } from "./types";
import { backend } from ".";
import { useGetBulbsQuery, useSetBulbMutation } from "./wizlightApi";

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

  return (
    <section className="section fixed-grid has-1-cols">
      <h1 className="title">Wizlight - Bulbs</h1>
      {bulbs.map((bulb: BulbStateType) => (
        <div className="grid">
          <div key={bulb.id} className="cell">
            <Bulb {...bulb} />
            <button onClick={() => toggleBulb(bulb.id)} className="button">
              Turn {bulb.state ? "off" : "on"}
            </button>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Bulbs;
