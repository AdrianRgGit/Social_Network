const express = require('express');
const router = express.Router()
const PostController = require('../controllers/PostController');
const { authentication } = require("../middlewares/authentication");



router.post('/create', authentication, PostController.create)
router.put('/id/:_id', authentication, PostController.update)
router.get('/id/:_id',PostController.getById)
router.get('/title/:title',PostController.getPostsByName)
router.get('/',PostController. getPostUserCommentById)
router.delete('/id/:_id',authentication, PostController.delete)


module.exports = router;