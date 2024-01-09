const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  body: { type: String, required: true, maxLength: 2000 },
  createdAt: { type: Date, imumutable: true, default: () => Date.now() },
  updatedAt: { type: Date, default: () => Date.now() },
});

messageSchema.virtual("url").get(function () {
  return `/api/posts/${this.post._id}/comments/${this._id}`;
});

module.exports = mongoose.model("Comment", messageSchema);
