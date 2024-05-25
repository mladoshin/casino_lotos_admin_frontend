import { io } from "socket.io-client";

export const createSocket = (accessToken: string) => {
    
  return io(import.meta.env.VITE_SOCKET_URL, {
    auth: {
      token: accessToken,
    },
  });
};
