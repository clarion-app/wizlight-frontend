import { useParams } from "react-router-dom";

const Room = () => {
    const { name } = useParams();

    return <div>{name}</div>;
};

export default Room;

