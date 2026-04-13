import { io } from "socket.io-client";

const SOCKET_URL = "/"; // Adjust to your backend URL

export const socket = io(SOCKET_URL, {
    autoConnect: true,
});
