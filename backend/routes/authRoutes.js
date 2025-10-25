const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ username, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ _id: user._id, username: user.username, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ _id: user._id, username: user.username, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
