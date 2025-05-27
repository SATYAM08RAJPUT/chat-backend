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
  res.json(sortedMessages);
});

io.on("connection", (socket) => {
  console.log("🟢 User connected");

  // ✅ When user joins
  socket.on("join", (username) => {
    const joinMsg = {
      username: "System",
      message: `${username} has joined the chat`,
      timestamp: new Date(),
      type: "info",
    };
    messages.push(joinMsg);
    io.emit("user joined", joinMsg);
  });

  // ✅ Regular chat message
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
