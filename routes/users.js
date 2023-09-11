const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authentication, isAuthorUser } = require("../middlewares/authentication");
const { uploadUserImages } = require("../middlewares/multer");

router.get("/getuserconnected", authentication, UserController.getUserConnected);
router.get("/getuserbyusername/:username", UserController.getUserByUserName);
router.get("/getuserbyid/:_id", UserController.getUserById);
router.get("/confirm/:email", UserController.confirm);
router.get('/recoverpassword/:email',UserController.recoverPassword)
router.get("/images/:imageName", UserController.serveUserImage)

router.post( "/register", uploadUserImages.single("avatar"), UserController.register);
router.post("/login", UserController.login);

router.put("/update", authentication, isAuthorUser, uploadUserImages.single("avatar"), UserController.update)
router.put('/resetpassword/:recoverToken',UserController.resetPassword)
router.put("/follow/:_id", authentication, UserController.follow);
router.put("/unfollow/:_id", authentication, UserController.unfollow);

router.delete("/logout", authentication, UserController.logout);

module.exports = router;
