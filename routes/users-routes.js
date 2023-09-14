const express = require("express");
const usersController = require("../controller/users-controller");
const fileUpload = require('../middleware/file-upload')
const { check } = require("express-validator");

const router = express.Router();

router.get("/", usersController.getUser);
const multer = require('multer')
const upload = multer({dest:"uploads/"})

router.post(
  "/signup",
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

module.exports = router;
