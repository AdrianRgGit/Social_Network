const Comment = require("../models/comment");
const User = require("../models/user");
const Post = require("../models/post");

const CommentController = {
  
  async getById(req, res) {
    try {
      const comment = await Comment.findById(req.params._id);
      
      if (!comment) {
        return res.status(400).send({ message: "This comment doesn't exist" });
      }
      
      res.send(comment);
    } catch (error) {
      console.error(error);
    }
  },

  async create(req, res, next) {
    try {
      const userConnected = await User.findById(req.user._id);
      req.body.userId = userConnected._id;

      const comment = await Comment.create(req.body);
      await Post.findByIdAndUpdate(req.body.postId, {
        $push: { commentIds: comment._id },
      });
      res.status(201).send({ msg: "Comment created correctly", comment });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  
  async update(req, res) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params._id,
        { ...req.body, image: req.file.filename },
        { new: true }
      );

      res.send({ message: "Comment successfully updated", comment });
    } catch (error) {
      console.error(error);
    }
  },
  
  async like(req, res) {
    try {
      const comment = await Comment.findById(req.params._id);
      const alreadyLiked = comment.likes.includes(req.user._id);
      if (alreadyLiked) {
        return res
          .status(400)
          .send({ message: "You have already liked this comment" });
      } else {
        const comment = await Comment.findByIdAndUpdate(
          req.params._id,

          { $push: { likes: req.user._id } },

          { new: true }
        );

        res.send(comment);
      }
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: "There was a problem with your like" });
    }
  },

  async dislike(req, res) {
    try {
      const findComment = await Comment.findById(req.params._id);
      const alreadyLiked = findComment.likes.includes(req.user._id);

      if (alreadyLiked === false) {
        return res
          .status(400)
          .send({ message: "You have already disliked this comment" });
      }

      await Comment.updateOne(
        findComment,
        { $pull: { likes: req.user._id } },
        { new: true }
      );

      res.send(findComment);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: "There was a problem with your like" });
    }
  },

  async delete(req, res) {
    try {
      const comment = await Comment.findByIdAndDelete(req.params._id);

      res.send({ message: "Comment deleted", comment });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "There was a problem trying to remove the comment" });
    }
  },
};

module.exports = CommentController;
