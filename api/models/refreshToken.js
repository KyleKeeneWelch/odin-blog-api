const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, imumutable: true, default: () => Date.now() },
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
