const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxLength: 100 },
  body: { type: String, required: true, maxLength: 2000 },
  createdAt: { type: Date, imumutable: true, default: () => Date.now() },
  updatedAt: { type: Date, default: () => Date.now() },
  published: { type: Boolean, default: () => true },
});

postSchema.virtual("url").get(function () {
  return `/api/posts/${this.post._id}`;
});

module.exports = mongoose.model("Post", postSchema);
