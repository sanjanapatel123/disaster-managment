import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});

socket.on("disaster_created", (data) => {
  console.log("New disaster received:", data);
});

socket.on("disaster_updated", (data) => {
  console.log("Disaster update received:", data);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection failed:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

socket.io.on("reconnect", (attempt) => {
  console.log("Socket reconnected after attempts:", attempt);
});

socket.io.on("reconnect_error", (error) => {
  console.error("Reconnect failed:", error.message);
});
