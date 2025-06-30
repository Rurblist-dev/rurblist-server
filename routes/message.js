const express = require("express");

const router = express.Router();

// Get all messages in a chat
router.get("/chats/:chatId/messages", async (req, res) => {
  // TODO: Fetch messages by chatId
  res.send("Get all messages in a chat");
});

// Send a new message in a chat
router.post("/chats/:chatId/messages", async (req, res) => {
  // TODO: Add new message to chat
  res.send("Send a new message");
});

// Get a single message by ID
router.get("/messages/:messageId", async (req, res) => {
  // TODO: Fetch message by messageId
  res.send("Get a single message");
});

// Delete a message
router.delete("/messages/:messageId", async (req, res) => {
  // TODO: Delete message by messageId
  res.send("Delete a message");
});

// Edit a message
router.put("/messages/:messageId", async (req, res) => {
  // TODO: Update message by messageId
  res.send("Edit a message");
});

module.exports = router;
