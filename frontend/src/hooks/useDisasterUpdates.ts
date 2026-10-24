"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

type DisasterEvent = {
  id?: string;
  title?: string;
};

export function useDisasterUpdates(onUpdate: () => void) {
  useEffect(() => {
    const socket = getSocket();

    const handleUpdate = (_data: DisasterEvent) => {
      onUpdate();
    };

    socket.on("disaster_created", handleUpdate);
    socket.on("disaster_updated", handleUpdate);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("disaster_created", handleUpdate);
      socket.off("disaster_updated", handleUpdate);
    };
  }, [onUpdate]);
}
