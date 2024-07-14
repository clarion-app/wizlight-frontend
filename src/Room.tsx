import { useParams } from "react-router-dom";

const Room = () => {
    const { name } = useParams();

    return <section className="section fixed-grid has-2-cols">
      <h1 className="title">Wizlight - {name}</h1>
    </section>;
};

export default Room;

