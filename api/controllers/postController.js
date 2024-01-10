const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

exports.posts_get = (req, res) => {
  res.json(res.paginatedResults);
};

exports.post_get = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .select({ published: 0 })
    .populate("user", { password: 0 })
    .exec();

  if (post === null) {
    const err = new Error("No Post Found");
    err.status = 404;
    return next(err);
  }

  res.json(post);
});

exports.post_post = [
  body("title", "Title is required").trim().isLength({ min: 1 }).escape(),
  body("body", "Body is required").trim().isLength({ min: 1 }).escape(),
  body("published", "Published is required")
    .isLength({ min: 1 })
    .escape()
    .customSanitizer((value, { req }) => {
      return value == "true";
    }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = new Post({
      user: req.user.id,
      title: req.body.title,
      body: req.body.body,
      createdAt: Date.now(),
      published: req.body.published,
    });

    if (!errors.isEmpty()) {
      res.sendStatus(403);
      return;
    } else {
      await post.save();
      res.sendStatus(200);
    }
  }),
];

exports.post_put = [
  body("title", "Title is required").trim().isLength({ min: 1 }).escape(),
  body("body", "Body is required").trim().isLength({ min: 1 }).escape(),
  body("published", "Published is required")
    .isLength({ min: 1 })
    .escape()
    .customSanitizer((value, { req }) => {
      return value == "true";
    }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const existingPost = await Post.findById(req.params.id).exec();

    if (existingPost === null) {
      const err = new Error("No Post Found");
      err.status = 404;
      return next(err);
    }

    const post = new Post({
      user: req.user.id,
      title: req.body.title,
      body: req.body.body,
      published: req.body.published,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.sendStatus(403);
      return;
    } else {
      await Post.findByIdAndUpdate(req.params.id, post, {});
      res.sendStatus(200);
    }
  }),
];

exports.post_delete = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).exec();
  if (post === null) {
    const err = new Error("No Post Found");
    err.status = 404;
    return next(err);
  }

  await Post.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});
