const Comment = require("../models/comment");
const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

exports.comments_get = (req, res) => {
  res.json(res.paginatedResults);
};

exports.comment_get = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params._id)
    .populate("user", { password: 0 })
    .populate("post")
    .exec();

  if (comment.post.published == false) {
    const err = new Error("Cannot get comment for an unpublished post");
    err.status = 403;
    return next(err);
  }

  if (comment === null) {
    const err = new Error("No Comment Found");
    err.status = 404;
    return next(err);
  }

  res.json(comment);
});

exports.comment_post = [
  body("body", "Body is required").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.params.id).exec();

    if (post === null) {
      const err = new Error("No Post Found");
      err.status = 404;
      return next(err);
    }

    const comment = new Comment({
      user: req.user.id,
      post: req.params.id,
      body: req.body.body,
      createdAt: Date.now(),
    });

    if (!errors.isEmpty()) {
      res.sendStatus(403);
      return;
    } else {
      await comment.save();
      res.sendStatus(200);
    }
  }),
];

exports.comment_put = [
  body("body", "Body is required").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.params.id).exec();

    if (post === null) {
      const err = new Error("No Post Found");
      err.status = 404;
      return next(err);
    }

    const existingComment = await Comment.findById(req.params._id).exec();

    if (existingComment === null) {
      const err = new Error("No Comment Found");
      err.status = 404;
      return next(err);
    }

    const comment = new Post({
      user: req.user.id,
      post: req.params.id,
      body: req.body.body,
      _id: req.params._id,
    });

    if (!errors.isEmpty()) {
      res.sendStatus(403);
      return;
    } else {
      await Comment.findByIdAndUpdate(req.params._id, comment, {});
      res.sendStatus(200);
    }
  }),
];

exports.comment_delete = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params._id).exec();
  if (comment === null) {
    const err = new Error("No Comment Found");
    err.status = 404;
    return next(err);
  }

  await Comment.findByIdAndDelete(req.params._id);
  res.sendStatus(200);
});
