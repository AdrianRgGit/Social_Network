const mongoose = require("mongoose");
const ObjectId = mongoose.SchemaTypes.ObjectId;

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
    },

    email: {
      type: String,
      match: [/.+\@.+\..+/, "insert a valid email"],
      unique: true,
      required: [true, "please complete all fields"],
    },

    password: {
      type: String,
      required: [true, "password is required"],
    },

    postIds: [{ type: ObjectId, ref: "Post" }],
    commentIds: [{ type: ObjectId, ref: "Comment" }],
    followers: [{ type: ObjectId, ref: "User" }],

    avatar: String,
    role: String,
    confirmed: Boolean,
    tokens: [],
  },
  { timestamps: true }
);

// Agregar una propiedad virtual para la URL del avatar
UserSchema.virtual("avatar_url").get(function () {
  if (this.avatar) {
    return `/assets/images/user/${this.avatar}`;
  }
  // Si no hay avatar, puedes proporcionar una URL predeterminada o manejarlo de la manera que prefieras
  return "/assets/images/user/default-avatar.jpg"; // Cambia la ruta según tu estructura de carpetas
});

UserSchema.methods.toJSON = function () {
  const user = this._doc;
  delete user.tokens;
  delete user.password;
  delete user.createdAt;
  delete user.updatedAt;
  delete user.confirmed;
  delete user.role;
  delete user.__v;

  // Agregar la URL del avatar
  user.avatar_url = this.avatar_url;
  return user;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
