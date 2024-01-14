require("dotenv").config();
const express = require("express");
const passport = require("passport");
const {
  jwtStrategy,
  refreshJwtStrategy,
  localStrategy,
} = require("../helpers/passport-config");

const api = require("../routes/api");
const auth = require("../routes/auth");

const app = express();

passport.use("jwt", jwtStrategy);
passport.use("refreshJwt", refreshJwtStrategy);
passport.use("login", localStrategy);

app.use(express.json());
app.use("/api", api);
app.use("/auth", auth);

app.get("/", (req, res) => {
  res.status(200).json({ alive: "True" });
});

module.exports = app;
