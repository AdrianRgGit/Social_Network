const Post = require("../models/post");

// configura path para después poder utilizar las imágenes en Frontend
const path = require("path");
const User = require("../models/user");

const PostController = {
  async getAll(req, res) {
    try {
      const posts = await Post.find().populate("userId").populate("commentIds");

      res.send(posts);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "There was a problem" });
    }
  },

  async getById(req, res) {
    try {
      const post = await Post.findById(req.params._id)
        .populate("userId")
        .populate("commentIds");

      if (!post) {
        return res.status(400).send({ message: "This post doesn't exist" });
      }

      res.send(post);
    } catch (error) {
      console.error(error);
    }
  },

  async getPostsByName(req, res) {
    try {
      if (req.params.title.length > 20) {
        return res.status(400).send("To long search");
      }

      const title = new RegExp(req.params.title, "i");

      const posts = await Post.find({ title });

      if (!posts) {
        return res.status(400).send({ message: "This post doesn't exist" });
      }

      res.send(posts);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: "There was a problem" });
    }
  },

  async getPostUserComment(req, res) {
    try {
      let x = req.someValue;
      if (typeof x === "string") {
        x = x.replace(/[{()}]/g, "");
      }

      const { page = 1, limit = 10 } = req.query;
      const post = await Post.find()
        .populate("userId", "username")
        .populate("commentIds", "title body")
        .limit(parseInt(limit))
        .skip((page - 1) * limit)
        .exec();

      res.send(post);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },

  async create(req, res, next) {
    try {
      const post = await Post.create({
        ...req.body,
        userId: req.user._id,
        image: req.file?.filename,
      });

      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { postIds: post._id } },
        { new: true }
      );
      res.status(201).send({ msg: "Post created correctly", post });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  async update(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params._id,
        { ...req.body, image: req.file?.filename },
        { new: true }
      );

      res.send({ message: "Post successfully updated", post });
    } catch (error) {
      console.error(error);
    }
  },

  async like(req, res) {
    try {
      const post = await Post.findById(req.params._id);
      const alreadyLiked = post.likes?.includes(req.user._id);
      if (alreadyLiked) {
        return res
          .status(400)
          .send({ message: "You have already liked this post" });
      } else {
        const post = await Post.findByIdAndUpdate(
          req.params._id,

          { $push: { likes: req.user._id } },

          { new: true }
        );

        res.send(post);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "There was a problem with your like" });
    }
  },

  async dislike(req, res) {
    try {
      const findPost = await Post.findById(req.params._id);
      const alreadyLiked = findPost.likes.includes(req.user._id);

      if (alreadyLiked === false) {
        return res
          .status(400)
          .send({ message: "You have already disliked this post" });
      }

      const post = await Post.findByIdAndUpdate(
        findPost._id,
        { $pull: { likes: req.user._id } },
        { new: true }
      );

      res.send(post);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: "There was a problem with your like" });
    }
  },

  async delete(req, res) {
    try {
      const post = await Post.findByIdAndDelete(req.params._id);
      res.send({ message: "Post deleted", post });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "There was a problem trying to remove the post" });
    }
  },

  async servePostImage(req, res) {
    try {
      const imageName = req.params.imageName;
      const imagePath = path.join(
        __dirname,
        "../assets/images/post",
        imageName
      );
      res.sendFile(imagePath);
    } catch (error) {
      res.status(500).send({ message: "Error serving post image", error });
    }
  },
};

module.exports = PostController;
