import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // Match your backend server port

export default socket;