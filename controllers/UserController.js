const User = require("../models/user");
const transporter = require("../config/nodemailer");
require("dotenv").config();

// configura path para después poder utilizar las imágenes en Frontend
const path = require("path");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;

const UserController = {
  async getUserConnected(req, res) {
    try {
      const getUser = await User.findById(req.user._id).populate("postIds");

      res.send({ message: "User: ", getUser });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "There was a problem with server", error });
    }
  },

  async getUserByUserName(req, res) {
    try {
      if (req.params.username.length > 20) {
        return res.status(400).send("To long search");
      }

      const username = new RegExp(req.params.username, "i");

      const users = await User.find({ username });

      if (!users) {
        return res.status(400).send({ message: "This user doesn't exist" });
      }

      res.send(users);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "There was a problem with server", error });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params._id);

      if (!user) {
        return res.status(400).send({ message: "This user doesn't exist" });
      }

      res.send(user);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "There was a problem with server", error });
    }
  },

  async register(req, res, next) {
    try {
      req.body.role = "user";
      const url = "http://localhost:3000/users/confirm/" + req.body.email;
      await transporter.sendMail({
        to: req.body.email,
        subject: "Confirm your registration",
        html: `<h3>Welcome, you are almost registered</h3>
          <a href="${url}">Click to confirm your registration</a>`,
      });

      const password = await bcrypt.hash(req.body.password, 10);

      const user = await User.create({
        ...req.body,
        password,
        confirmed: false,
        avatar: req.file?.filename,
      });
      res.status(201).send({ message: "User successfully registered", user });
    } catch (error) {
      next(error);
      console.error(error);
    }
  },

  async update(req, res) {
    try {
      const password = await bcrypt.hash(req.body.password, 10);

      const user = await User.findByIdAndUpdate(
        req.params._id, 
        { ...req.body, password, avatar: req.file?.filename },
        { new: true }
      );

      if (!user) {
        return res.status(400).send({ message: "This user doesn't exist" });
      }

      res.send({ message: "User successfully updated", user });
    } catch (error) {
      console.error(error);
    }
  },

  async login(req, res, next) {
    try {
      const user = await User.findOne({
        email: req.body.email,
      });

      if (!user) {
        return res
          .status(400)
          .send({ message: "Incorrect username or password" });
      }

      if (!user.confirmed) {
        return res.status(400).send({ message: "You must confirm your email" });
      }

      const isMatch = bcrypt.compareSync(req.body.password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .send({ message: "Incorrect username or password" });
      }

      const token = jwt.sign({ _id: user._id }, jwt_secret);

      if (user.tokens.length > 4) {
        user.tokens.shift();
      }

      user.tokens.push(token);
      await user.save();
      console.log(user)
      res.send({ 
        message: "Welcome " + user.username, 
        token,  
        user: user.username,
        userObject: user,
      });
    } catch (error) {
      next(error);
      console.error(error);
      res
        .status(500)
        .send({ message: "There was a problem with login", error });
    }
  },

  async logout(req, res) {
    try {
      const token = req.headers.authorization;
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { tokens: token },
      });

      res.send({ message: "Successfully logged out" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "There was a problem with logout", error });
    }
  },

  async confirm(req, res) {
    try {
      await User.updateOne(
        { email: req.params.email },
        { $set: { confirmed: true } }
      );
      res.status(201).send("User successfully confirmed");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "There was a problem with confirmation", error });
    }
  },

  async follow(req, res) {
    try {
      const user = await User.findById(req.params._id);
      const userConnected = await User.findById(req.user._id);

      const alreadyFollow = user.followers.includes(req.user._id);

      if (userConnected._id.toString() === user._id.toString()) {
        return res.status(400).send({ message: "You cannot follow yourself" });
      }

      if (alreadyFollow) {
        return res
          .status(400)
          .send({ message: "You have already follow this user" });
      } else {
        const user = await User.findByIdAndUpdate(
          req.params._id,
          { $push: { followers: req.user._id } },
          { new: true }
        );
        res.send(user);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "There was a problem with your follow" });
    }
  },

  async unfollow(req, res) {
    try {
      const findUser = await User.findById(req.params._id);

      const alreadyFollow = findUser.followers.includes(req.user._id);

      if (alreadyFollow === false) {
        return res
          .status(400)
          .send({ message: "You have already unfollow this user" });
      }

      await User.updateOne(
        findUser,
        { $pull: { followers: req.user._id } },
        { new: true }
      );

      res.send(findUser);
    } catch (error) {
      console.error(error);

      res.status(500).send({ message: "There was a problem with your follow" });
    }
  },

  async recoverPassword(req, res) {
    try {
      const recoverToken = jwt.sign({ email: req.params.email }, jwt_secret, {
        expiresIn: "48h",
      });

      const url = "http://localhost:3000/users/resetpassword/" + recoverToken;

      await transporter.sendMail({
        to: req.params.email,

        subject: "Recover password",
        html: `<h3> Recover password </h3>   
    <a href="${url}">Recover password</a>   
    The link expires in 48 hours`,
      });

      res.send({
        message: "Email sent to your mail to reset password",
      });
    } catch (error) {
      console.error(error);
    }
  },

  async resetPassword(req, res) {
    try {
      const recoverToken = req.params.recoverToken;

      const payload = jwt.verify(recoverToken, jwt_secret);
      const password = await bcrypt.hash(req.body.password, 10);

      await User.findOneAndUpdate(
        { email: payload.email },

        { password: password }
      );

      res.send({ message: "password changed succesfully" });
    } catch (error) {
      console.error(error);
    }
  },



  async serveUserImage(req, res) {
    try {
      const imageName = req.params.imageName;
      const imagePath = path.join(
        __dirname,
        "../assets/images/user",
        imageName
      );
      res.sendFile(imagePath);
    } catch (error) {
      res.status(500).send({ message: "Error serving user image", error });
    }
  },
};

module.exports = UserController;
