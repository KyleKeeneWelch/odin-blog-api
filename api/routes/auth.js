var express = require("express");
var router = express.Router();

const authController = require("../controllers/authController");

/* GET home page. */
router.post("/login", authController.login_post);

router.post("/signup", authController.signup_post);

router.post("/token", authController.refresh_token_post);

router.delete("/logout", authController.logout_delete);

module.exports = router;
