/*
Posts Route | Server | SUITAPP Web App
GROUP 1: Amine Bensalem, Douglas MacKrell, Savita Madray, Joseph P. Pasaoa
*/


// TODOS
/* 
- tweak upload method to preserve filename in server
- edit post route (for captions [and indirectly hashtags] only)
*/


/* MODULE INITS */
//    external
const express = require('express');
    const router = express.Router();
const multer = require('multer');
    const storage = multer.diskStorage({
        destination: (request, file, cb) => {
          cb(null, './public/images/posts');
        },
        filename: (request, file, cb) => {
          const fileName = Date.now() + "-" + file.originalname;
          cb(null, fileName);
        }
    });
    const fileFilter = (request, file, cb) => {
      if ((file.mimetype).slice(0, 6) === 'image/') {
          cb(null, true);
      } else {
          cb(null, false);
      }
    };
    const upload = multer({ 
        storage: storage,
        fileFilter: fileFilter,
    });
//    local
const { handleError, getAuth, checkDoesUserExist } = require('../helpers/globalHelp.js');
const { processInput } = require('../helpers/postsHelp.js');
const { 
  getAllPosts,
  getAllPostsByUser,
  getAllPostsByHashtags,
  getOnePost,
  createPost,
  deletePost
} = require('../queries/posts.js');


/* ROUTE HANDLES */
//    getAllPosts: get global user posts. limit 10, optional offset
router.get("/", async (req, res, next) => {
    try {
      const offset = processInput(req, "offset");
      const allPosts = await getAllPosts(offset);
      res.json({
          status: "success",
          message: "all posts retrieved",
          payload: allPosts.length === 1 ? allPosts[0] : allPosts
      });
    } catch (err) {
      handleError(err, req, res, next);
    }
});

//    getAllPostsByUser: get all of a single user's posts. limit 10, optional offset
router.get("/userid/:id", async (req, res, next) => {
    try {
        const userId = processInput(req, "userId");
        const offset = processInput(req, "offset");
        const allPostsByUser = await getAllPostsByUser(userId, offset);
        await checkDoesUserExist(allPostsByUser, userId);
        res.json({
            status: "success",
            message: `all posts of user ${userId} retrieved`,
            payload: allPostsByUser.length === 1 ? allPostsByUser[0] : allPostsByUser
        });
    } catch (err) {
      handleError(err, req, res, next);
    }
});

//    getAllPostsByHashtags: get all users' posts by hashtags. limit 10, optional offset
router.get("/tags", async (req, res, next) => {
    try {
      const hashtags = processInput(req, "search hashtags");
      const offset = processInput(req, "offset");
      const allPostsByHashtags = await getAllPostsByHashtags(hashtags.formatted, offset);
      res.json({
          status: "success",
          message: `all posts with hashtags '${hashtags.parsed}' retrieved`,
          payload: allPostsByHashtags
      });
    } catch (err) {
      handleError(err, req, res, next);
    }
});

//    getOnePost: get one single post by post_id
router.get("/:postId", async (req, res, next) => {
    try {
      const postId = processInput(req, "postId");
      const onePost = await getOnePost(postId);
      res.json({
          status: "success",
          message: `post ${postId} retrieved`,
          payload: onePost
      });
    } catch (err) {
      if (err.message === "No data returned from the query.") {
        res
          .status(404)
          .json({
              status: "fail",
              message: `no post with id ${req.params.postId} found`,
              payload: null
          });
      } else {
        handleError(err, req, res, next);
      }
    }
});

//    createPost: create a single post
router.post("/add", upload.single("posts"), async (req, res, next) => {
    try {
      const imageUrl = processInput(req, "imageUrl");
      const { caption, formattedHashtags } = processInput(req, "caption");
      const currUserId = processInput(req, "currUserId");
      const password = processInput(req, "password");
      const authorized = await getAuth(currUserId, password);
      if (authorized) {
        const response = await createPost({
            ownerId: currUserId,
            caption,
            formattedHashtags,
            imageUrl
        });
        res.json({
            status: "success",
            message: "new post created",
            payload: response
        });
      } else {
        throw new Error("401__error: authentication failure");
      }
    } catch (err) {
      handleError(err, req, res, next);
    }
});

//    deletePost: delete a post by post_id
router.patch("/delete/:postId", async (req, res, next) => {
    try {
      const postId = processInput(req, "postId");
      const currUserId = processInput(req, "currUserId");
      const password = processInput(req, "password");
      const authorized = await getAuth(currUserId, password);
      if (authorized) {
        const response = await deletePost(postId);
        res.json({
            status: "success",
            message: `post ${postId} deleted`,
            payload: response
        });
      } else {
        throw new Error("401__error: authentication failure");
      }
    } catch (err) {
      handleError(err, req, res, next);
    }
});


/* EXPORT */
module.exports = router;
