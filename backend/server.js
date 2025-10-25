require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const limiter = require("./middleware/rateLimitMiddleware");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);

// ✅ Connect to MongoDB Atlas
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(limiter);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("user-online", async (userId) => {
    onlineUsers[userId] = socket.id;
    await User.findByIdAndUpdate(userId, { online: true });
    io.emit("online-users", Object.keys(onlineUsers));
  });

  socket.on("private-message", async ({ senderId, recipientId, content }) => {
    const recipientSocket = onlineUsers[recipientId];
    if (recipientSocket) {
      io.to(recipientSocket).emit("private-message", { senderId, content });
    }
  });

  socket.on("disconnect", async () => {
    console.log("❌ User disconnected:", socket.id);
    const userId = Object.keys(onlineUsers).find((key) => onlineUsers[key] === socket.id);
    if (userId) {
      delete onlineUsers[userId];
      await User.findByIdAndUpdate(userId, { online: false });
      io.emit("online-users", Object.keys(onlineUsers));
    }
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
