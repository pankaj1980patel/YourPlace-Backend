const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

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
    allUser: allUser.map((user) => user.toObject({ getters: true })),
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
  const createdUser = new User({
    name,
    email,
    password,
    image:
      "https://www.shareicon.net/data/128x128/2016/07/26/802013_man_512x512.png",
    places:[],
  });
  try {
    await createdUser.save();
  } catch (error) {
    return next(new HttpError("Signup failed, Place try again", 500));
  }
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    return next(new HttpError("Signup failed, Please try again later", 500));
  }
  if (!existingUser || existingUser.password !== password) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 401)
    );
  }
  res.json({
    message: "Loggen In!",
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
