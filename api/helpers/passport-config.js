const LocalStrategy = require("passport-local").Strategy;
const Jwtstrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcrypt");

const User = require("../models/user");

exports.jwtStrategy = new Jwtstrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_SECRET,
    passReqToCallback: true,
  },
  async (req, data, done) => {
    if (!data) {
      return done(null, null, { message: "Invalid token" });
    }
    req.user = data.data;
    return done(null, data.data);
  }
);

exports.refreshJwtStrategy = new Jwtstrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.REFRESH_TOKEN_SECRET,
  },
  async (data, done) => {
    if (!data) {
      return done(null, null, { message: "Invalid token" });
    }
    return done(null, data.data);
  }
);

exports.localStrategy = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  async (email, password, done) => {
    try {
      const result = await User.findOne({ email: email });
      if (!result) {
        return done(null, false, { message: "User not found" });
      }
      const passwordMatches = await bcrypt.compare(password, result.password);

      if (!passwordMatches) {
        return done(null, false, { message: "Invalid credentials" });
      }

      const user = {
        id: result._id.toString(),
        first_name: result.first_name,
        last_name: result.last_name,
        username: result.username,
        email: result.email,
        password: result.password,
      };

      return done(null, user, { message: "User logged in" });
    } catch (error) {
      return done(error);
    }
  }
);
