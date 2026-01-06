const express = require("express");
const router = express.Router();

const {
  sendOTP,
  signup,
  login,
  changePassword,
} = require("../Controllers/Auth");

// auth routes
router.post("/sendotp", sendOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/changePassword", changePassword);

module.exports = router;
