// models/Message
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: String,
  sender: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = { Message };
