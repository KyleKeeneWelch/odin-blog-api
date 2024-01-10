const express = require("express");
const router = express.Router();
const passport = require("passport");

const commentController = require("../controllers/commentController");
const postController = require("../controllers/postController");
const userController = require("../controllers/userController");

const { paginatedResults, checkIdFormat } = require("../helpers/middleware");

const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");

// User

router.get("/users", paginatedResults(User), userController.users_get);

router.get("/users/:id", checkIdFormat(), userController.user_get);

router.put(
  "/users/:id",
  checkIdFormat(),
  passport.authenticate("jwt", { session: false }),
  userController.user_put
);

router.delete(
  "/users/:id",
  checkIdFormat(),
  passport.authenticate("jwt", { session: false }),
  userController.user_delete
);

// Post

router.get("/posts", paginatedResults(Post), postController.posts_get);

router.get("/posts/:id", checkIdFormat(), postController.post_get);

router.post(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  postController.post_post
);

router.put(
  "/posts/:id",
  checkIdFormat(),
  passport.authenticate("jwt", { session: false }),
  postController.post_put
);

router.delete(
  "/posts/:id",
  checkIdFormat(),
  passport.authenticate("jwt", { session: false }),
  postController.post_delete
);

// Comment

router.get(
  "/posts/:id/comments",
  paginatedResults(Comment),
  commentController.comments_get
);

router.get(
  "/posts/:id/comments/:_id",
  checkIdFormat(),
  commentController.comment_get
);

router.post(
  "/posts/:id/comments",
  passport.authenticate("jwt", { session: false }),
  commentController.comment_post
);

router.put(
  "/posts/:id/comments/:_id",
  checkIdFormat(),
  passport.authenticate("jwt", { session: false }),
  commentController.comment_put
);

router.delete(
  "/posts/:id/comments/:_id",
  checkIdFormat(),
  passport.authenticate("jwt", { session: false }),
  commentController.comment_delete
);

module.exports = router;
