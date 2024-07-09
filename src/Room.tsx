import { useParams } from "react-router-dom";

const Room = (argId: string | null) => {
    const { id } = useParams();
    if(argId === null && id === undefined) {
        return <div>Invalid room</div>;
    }

    const roomId = argId || id;

    return <div>Room {roomId}</div>;
};

export default Room;

