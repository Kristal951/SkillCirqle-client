import { createContext, useContext } from "react";

export const SocketContext = createContext<{ socketReady: boolean }>({
  socketReady: false,
});

export const useSocketContext = () => useContext(SocketContext);