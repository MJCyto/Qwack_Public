import { useEffect, useState } from "react";
import { database } from "../conf/firebase";

const useCollection = collection => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsubscribe = database.collection(collection).onSnapshot(
      snapshot => {
        const collectionData = snapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setData(collectionData);
      },
      () => {
        setError(true);
      }
    );
    setLoading(false);
    return () => unsubscribe();
  }, [collection]);
  return [data, loading, error];
};

export default useCollection;
