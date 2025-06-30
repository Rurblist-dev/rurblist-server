// socket.js
const { Message } = require("./schemas/Message.js");

const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("chat-message", (message) => {
      console.log("Received:", message);
      socket.broadcast.emit("chat-message", message);
    });

    socket.on("register", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("disconnect", () => {
      [...onlineUsers.entries()].forEach(([uid, sid]) => {
        if (sid === socket.id) {
          onlineUsers.delete(uid);
        }
      });
      io.emit("online-users", Array.from(onlineUsers.keys()));
      console.log("User disconnected:", socket.id);
    });

    socket.on("join-room", async (roomId) => {
      socket.join(roomId);
      const messages = await Message.find({ roomId })
        .sort({ timestamp: 1 })
        .lean();
      socket.emit("chat-history", messages);
    });

    socket.on("private-message", async ({ roomId, message, sender }) => {
      const newMsg = await Message.create({ roomId, sender, content: message });
      socket.to(roomId).emit("private-message", {
        message,
        sender,
        timestamp: newMsg.timestamp,
      });
    });

    socket.on("user-typing", ({ roomId, user }) => {
      socket.to(roomId).emit("user-typing", user);
    });
  });
};

module.exports.onlineUsers = onlineUsers;
