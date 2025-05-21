import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// ✅ In-memory message store
const messages = [];

app.get("/messages", (req, res) => {
  const sortedMessages = messages.sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  console.log("sortedMessages:-", sortedMessages);
  res.json(sortedMessages);
});

io.on("connection", (socket) => {
  console.log("🟢 User connected");

  socket.on("chat message", (data) => {
    const newMsg = {
      username: data.username,
      message: data.message,
      timestamp: new Date(),
    };
    messages.push(newMsg);
    io.emit("chat message", newMsg);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

const PORT = process.env.PORT || 7003;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
