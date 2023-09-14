const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const DUMMY_USSERS = [
  {
    id: "u1",
    name: "Pankaj Patel",
    email: "test@gmail.com",
    password: "fsfdfsdfs",
  },
];

const getUser = async (req, res, next) => {
  let allUser;
  try {
    allUser = await User.find({}, "-password");
  } catch (error) {
    return next(
      new HttpError("'Fetching user failed, Please try again later", 500)
    );
  }
  res.json({
    users: allUser.map((user) => user.toObject({ getters: true })),
  });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid input passes, please check your data", 422)
    );
  }

  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    return next(new HttpError("Signup failed, Please try again later", 500));
  }
  if (existingUser) {
    return next(
      new HttpError("User already exists, Please login instead.", 422)
    );
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Could not create user, Please try again later", 500)
    );
  }
  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });
  try {
    await createdUser.save();
  } catch (error) {
    return next(new HttpError("Signup failed, Place try again", 500));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Signup failed, Place try again", 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    return next(new HttpError("Signup failed, Please try again later", 500));
  }
  if (!existingUser) {
    return next(
      new HttpError("User not found, Please login!", 401)
    );
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(
      new HttpError(
        "Could not log you in, Please check your Credentials and try again",
        500
      )
    );
  }
  if (!isValidPassword) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 401)
    );
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Login failed, Place try again", 500));
  }
  res
    .status(201)
    .json({ userId: existingUser.id, email: existingUser.email, token: token });
};

exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
