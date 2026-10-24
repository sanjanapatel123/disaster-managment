import "dotenv/config";
import { createServer } from "node:http";
import app from "./app";
import { initializeSocket } from "./config/socket";

const PORT = Number(process.env.PORT) || 5000;

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
