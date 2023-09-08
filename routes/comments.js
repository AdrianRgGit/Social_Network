const express = require("express");
const router = express.Router();


const CommentController = require("../controllers/CommentController");
const { authentication, isAuthor } = require("../middlewares/authentication");
const {  uploadCommentImages } = require("../middlewares/multer");
  

router.get("/id/:_id", authentication, CommentController.getById);

router.post("/create", authentication, uploadCommentImages.single('image'),CommentController.create);

router.put("/id/:_id", authentication, isAuthor,  uploadCommentImages.single('image'), CommentController.update);
router.put("/like/:_id", authentication,CommentController.like);
router.put("/dislike/:_id", authentication, CommentController.dislike);

router.delete("/id/:_id", authentication, isAuthor, CommentController.delete);

module.exports = router;
