const express = require("express");
const usersController = require("../controller/users-controller");
const { check } = require("express-validator");

const router = express.Router();

router.get("/", usersController.getUser);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

module.exports = router;
