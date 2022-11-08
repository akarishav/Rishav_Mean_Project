const express = require("express");

// const user = require("../models/user");
const UserController = require("../controllers/user")

const router = express.Router();

router.post("/signup", UserController.createUser );

router.post("/login", UserController.userLogin);

module.exports = router;
