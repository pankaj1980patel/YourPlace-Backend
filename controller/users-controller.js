const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const DUMMY_USSERS = [
  {
    id: "u1",
    name: "Pankaj Patel",
    email: "test@gmail.com",
    password: "fsfdfsdfs",
  },
];

const getUser = (req, res, next) => {
  res.status(200);
  res.json({ users: DUMMY_USSERS });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid input passes, please check your data", 422)
    );
  }
  const { name, email, password } = req.body;
  const hasUser = DUMMY_USSERS.find((u) => u.email === email);
  if (hasUser) {
    return next(new HttpError("User already exists", 422));
  }
  const createdUser = { id: uuidv4(), name, email, password };
  DUMMY_USSERS.push(createdUser);
  res.status(201).json({ users: DUMMY_USSERS });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USSERS.find((u) => u.email === email);
  if (!identifiedUser || !identifiedUser.password === password) {
    return next(
      new HttpError("Could not identify user, credentials seem to wrong.", 401)
    );
  }
  res.json({ message: "Loggen In!" });
};

exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
