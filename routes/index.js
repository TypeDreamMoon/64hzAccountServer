const express = require("express");
const authRoutes = require("./auth");
const accountRoutes = require("./account");

const router = express.Router();

router.use("/", authRoutes);
router.use("/account", accountRoutes);

module.exports = router;