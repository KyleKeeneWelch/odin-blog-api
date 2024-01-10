const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");

exports.login_post = [
  body("email", "Email is required")
    .trim()
    .isLength({ min: 1 })
    .isEmail()
    .withMessage("Invalid email format")
    .escape(),
  body("password", "Password is required").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.sendStatus(403);
      return;
    } else {
      passport.authenticate("login", async (error, user, info) => {
        if (error) {
          return next(error);
        }

        if (!user) {
          const err = new Error(info.message);
          err.status = 404;
          return next(err);
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = new RefreshToken({
          token: generateRefreshAccessToken(user),
        });
        await refreshToken.save();

        res.json({
          accessToken: accessToken,
          refreshToken: refreshToken.token,
        });
      })(req, res, next);
    }
  }),
];

exports.signup_post = [
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
  body("password", "Password is required").trim().isLength({ min: 1 }).escape(),
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
      createdAt: Date.now(),
    });

    if (!errors.isEmpty()) {
      res.sendStatus(403);
      return;
    } else {
      await user.save();
      res.sendStatus(200);
    }
  }),
];

exports.refresh_token_post = asyncHandler(async (req, res, next) => {
  passport.authenticate(
    "refreshJwt",
    { session: false },
    async (error, user, info) => {
      if (error) {
        return next(error);
      }

      if (user === null) {
        const err = new Error("Invalid Token");
        err.status = 401;
        return next(err);
      }
      const accessToken = generateAccessToken(user);
      res.json({
        accessToken: accessToken,
      });
    }
  )(req, res, next);
});

exports.logout_delete = asyncHandler(async (req, res, next) => {
  const refreshToken = req.headers.authorization.split(" ")[1];

  if (refreshToken === null) {
    const err = new Error("Missing Refresh Token");
    err.status = 400;
    return next(err);
  }

  const result = await RefreshToken.findOneAndDelete({ token: refreshToken });

  if (!result) {
    const err = new Error("Refresh Token does not exist");
    err.status = 500;
    return next(err);
  }

  res.sendStatus(200);
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "10m" });
}

function generateRefreshAccessToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}
