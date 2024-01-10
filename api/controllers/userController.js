const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcrypt");

exports.users_get = (req, res) => {
  res.json(res.paginatedResults);
};

exports.user_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select({ password: 0 })
    .exec();

  if (user === null) {
    const err = new Error("No User Found");
    err.status = 404;
    return next(err);
  }

  res.json(user);
});

exports.user_put = [
  body("first_name", "First Name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("last_name", "Last Name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("username", "Username is required").trim().isLength({ min: 1 }).escape(),
  body("email", "Email is required")
    .trim()
    .isLength({ min: 1 })
    .isEmail()
    .withMessage("Invalid email format")
    .escape(),
  body("password", "Password is required with a minimum of 8 characters")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirm_password", "Confirm Password is required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Confirm Password needs to match Password"),
  body("admin", "Admin is required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .customSanitizer((value, { req }) => {
      return value == process.env.ADMIN_KEY;
    }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      admin: req.body.admin,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.sendStatus(403);
      return;
    } else {
      await User.findByIdAndUpdate(req.params.id, user, {});
      res.sendStatus(200);
    }
  }),
];

exports.user_delete = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();

  if (user === null) {
    const err = new Error("User Not Found");
    err.status = 404;
    return next(err);
  }

  await User.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});
