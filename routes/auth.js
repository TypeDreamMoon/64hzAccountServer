const express = require("express");
const router = express.Router();

/**
 * @api {get} / Welcome
 */
router.get("/", async (req, res) => {
	res.send("Welcome to 64hz Account server!");
});

module.exports = router;