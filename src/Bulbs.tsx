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
        setBulb({ id, state: { ...bulb, state: newState }}).then(() => {
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
  }

  return <div>
    <h2>List of bulbs</h2>
    <h3>Backend URL: {backend.url}</h3>
    {bulbs.map((bulb: BulbStateType) => (
      <div key={bulb.id}>
        <Bulb {...bulb} />
        <button onClick={() => toggleBulb(bulb.id)}>Turn {bulb.state ? "off" : "on"}</button>
      </div>
    ))}
  </div>;
};

export default Bulbs;
