const express = require("express");
const {
  getPopularHandicraftsByLocation,
} = require("../controllers/aiController");

const router = express.Router();

router.post("/popular-handicrafts", getPopularHandicraftsByLocation);

module.exports = router;