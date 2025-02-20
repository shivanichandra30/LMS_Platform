const express = require("express");
const router = express.Router();
const { registerStudent } = require("../controllers/registerController");

// Register new student
router.post("/register", registerStudent);

module.exports = router;
