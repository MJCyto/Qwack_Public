import { useEffect, useState } from "react";
import { database } from "../conf/firebase";

const useDocument = (collection, docID) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsubscribe = database
      .collection(collection)
      .doc(docID)
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
  }, [collection]);
  return [data, loading, error];
};

export default useDocument;
