const mongoose = require("mongoose");
const ObjectId = mongoose.SchemaTypes.ObjectId;

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
    },
    
    image:String,
    likes: [{ type: ObjectId, ref: "User" }],
    userId: { type: ObjectId, ref: "User" },
    commentIds: [{ type: ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

// Agregar una propiedad virtual para la URL de la image
PostSchema.virtual("image_url").get(function () {
  if (this.image) {
    return `/assets/images/post/${this.image}`;
  }
});

PostSchema.methods.toJSON = function () {
  const post = this._doc;  
  delete post.__v;

    // Agregar la URL de la image
    post.image_url = this.image_url;
  return post;
};

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
