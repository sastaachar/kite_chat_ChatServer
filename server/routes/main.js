const express = require("express");
const { getAllOnline } = require("../userData");
const router = express.Router();

router.get("/", (req, res) =>
  res.send(`Chat Server is up and running, ${getAllOnline()}`)
);

module.exports = router;
