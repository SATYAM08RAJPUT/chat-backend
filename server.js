import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// MongoDB connection string from .env file

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Message schema and model
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

// GET all messages sorted by time ascending
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Socket.IO connection and message handling
io.on("connection", (socket) => {
  console.log("🟢 User connected");

  socket.on("chat message", async (data) => {
    try {
      const newMsg = new Message({
        username: data.username,
        message: data.message,
      });
      await newMsg.save();

      io.emit("chat message", newMsg);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

const PORT = process.env.PORT || 7003;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
