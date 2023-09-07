const express = require("express");
const router = express.Router();

const PostController = require("../controllers/PostController");
const { authentication, isAuthor } = require("../middlewares/authentication");
const { uploadPostImages } = require("../middlewares/multer");

router.get("/getall", PostController.getAll)
router.get("/id/:_id", PostController.getById);
router.get("/title/:title", PostController.getPostsByName);
router.get("/", PostController.getPostUserComment);
router.get("/images/:imageName", PostController.servePostImage)

router.post("/create", authentication, uploadPostImages.single('image'), PostController.create);

router.put( "/id/:_id", authentication, isAuthor, uploadPostImages.single('image'), PostController.update);
router.put("/like/:_id", authentication, PostController.like);
router.put("/dislike/:_id", authentication, PostController.dislike);

router.delete("/delete/:_id", authentication, isAuthor, PostController.delete);

module.exports = router;
