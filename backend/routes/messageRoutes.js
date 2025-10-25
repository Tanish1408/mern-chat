const express = require("express");
const Message = require("../models/Message");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Fetch messages between two users
router.get("/:recipientId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.recipientId },
        { sender: req.params.recipientId, recipient: req.user._id },
      ],
    }).sort("createdAt");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post("/", protect, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content,
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
