import { useParams } from "react-router-dom";

const Room = () => {
    const { name } = useParams();

    return <div className="fixed-grid has-2-cols">
      <h1 className="title">Wizlight - {name}</h1>
    </div>;
};

export default Room;

