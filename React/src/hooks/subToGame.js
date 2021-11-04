import { useEffect, useState } from "react";
import { database } from "../conf/firebase";
import { useDispatch } from "react-redux";
import { updateGame } from "../actions/gameActions";

const subToGame = gameID => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = database
      .collection("games")
      .doc(gameID)
      .onSnapshot(
        doc => {
          setData(doc.data());
        },
        () => {
          setError(true);
        }
      );
    setLoading(false);
    return () => unsubscribe();
  });
  // dispatch(updateGame(data))
  return [loading, error];
};

export default subToGame;
