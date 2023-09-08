const User = require("../models/user");
const Post = require("../models/post");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;

const authentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const payload = jwt.verify(token, jwt_secret);

    const user = await User.findOne({ _id: payload._id, tokens: token });

    if (!user) {
      return res.status(401).send({ message: "You are not allowed" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .send({ error, message: "There was a problem with the token" });
  }
};

const isAuthor = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params._id);

    if (post.userId.toString() !== req.user._id.toString()) {
      return reserr
        .status(403)
        .send({ message: "You cannot edit elements that are not yours" });
    }

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).send({
      error,
      message: "There was a problem with the author check",
    });
  }
};

const isAuthorUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params._id);
    console.log(user)
    console.log(user._id)

    if (user._id.toString() !== req.user._id.toString()) {
      return reserr
        .status(403)
        .send({ message: "You cannot edit elements that are not yours" });
    }

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).send({
      error,
      message: "There was a problem with the author check",
    });
  }
};

module.exports = { authentication, /* isSuperAdmin, isAdmin, */ isAuthorUser, isAuthor };
