const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.send("Chat Server is up and running"));

module.exports = router;
