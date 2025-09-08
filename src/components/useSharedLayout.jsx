import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useEffect, useState } from "react";

const ydoc = new Y.Doc();
const provider = new WebsocketProvider(
  "wss://demos.yjs.dev",
  "sales-dashboard-layout",
  ydoc
);
const yarray = ydoc.getArray("kpiLayout");

export const useSharedLayout = () => {
  const [layout, setLayout] = useState([]);

  useEffect(() => {
    const updateHandler = () => {
      setLayout(yarray.toArray());
    };
    yarray.observe(updateHandler);
    if (yarray.length === 0) {
      // Initialize with some default order
      yarray.push(["1", "2", "3"]);
    } else {
      setLayout(yarray.toArray());
    }

    return () => {
      yarray.unobserve(updateHandler);
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  const updateLayout = (newLayout) => {
    ydoc.transact(() => {
      yarray.delete(0, yarray.length);
      yarray.push(newLayout);
    });
  };

  return [layout, updateLayout];
};
