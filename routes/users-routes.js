const express = require("express");
const usersController = require("../controller/users-controller");

const router = express.Router();

router.get("/", usersController.getUser);

router.post("/signup", usersController.signup);

router.post("/login", usersController.login);

module.exports = router;
