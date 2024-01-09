if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMS: 1 * 60 * 1000,
  max: 50,
});
const cors = require("cors");
const passport = require("passport");
const {
  jwtStrategy,
  refreshJwtStrategy,
  localStrategy,
} = require("./helpers/passport-config");

const authRouter = require("./routes/auth");
const apiRouter = require("./routes/api");

const app = express();

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// Change once know origins
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.options("*", cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(limiter);
app.use(cors());

passport.use("jwt", jwtStrategy);
passport.use("refreshJwt", refreshJwtStrategy);
passport.use("login", localStrategy);

app.use("/auth", cors(corsOptions), authRouter);
app.use("/api", cors(corsOptions), apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
