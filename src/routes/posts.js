const express = require('express')
const multer = require('multer')
const cloudinary = require('cloudinary')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const Model = require('../models/posts')
const UserModel = require('../models/users')
const response = require('../response')
const {
  getPost,
  getFollowedPeoplePosts,
  createPost
} = require('../services/posts')

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

//Traemos un post por medio de ID de usuario, para poder devolverlo al loguearnos
router.get('/:userId', async (req, res) => {
  try {
    const { query, params } = req
    const { userId } = params
    const { getLiked } = query
    const post = await getPost({ userId, getLiked })
    response.success(req, res, 200, post)
  } catch (error) {
    response.error(req, res, 500, error.message)
  }
})

//Get posts of followed people
router.get('/', async (req, res, next) => {
  const { query } = req
  const { userId } = query

  try {
    const posts = await getFollowedPeoplePosts({ userId })
    response.success(req, res, 200, posts)
  } catch (error) {
    next(error)
  }
})

//Enviamos un elemento a posts
router.post('/:userId', upload.single('postImage'), async (req, res) => {
  const { params, file, body } = req
  const { userId } = params
  const { content } = body
  try {
    const createdPost = await createPost({ userId, file, content })
    response.success(req, res, 201, createdPost) //Need to be tried
  } catch (error) {
    response.error(req, res, 500, error.message)
  }
})

router.patch('/:postId', upload.single('postImage'), async (req, res) => {
  try {
    if (!req.query.user) {
      throw Error('No se ingresó id')
    } else {
      const post = await Model.findById(req.params.postId)
      const user = await UserModel.findById(req.query.user)
      if (post.likes.includes(req.query.user)) {
        //Delete like
        const newArray = post.likes.filter((like) => like !== req.query.user)
        const newLikedPost = user.likedPost.filter(
          (postLiked) => post._id.toString() !== postLiked
        )
        post.likes = newArray
        user.likedPost = newLikedPost
      } else {
        //Add like
        post.likes.push(req.query.user)
        user.likedPost.push(req.params.postId)
      }
      await post.save()
      await user.save()
      res.status(201).send(post)
    }
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await Model.findByIdAndRemove(req.params.id)
    response.success(req, res, 200, 'Se eliminó el registro correctamente')
  } catch (error) {
    response.error(req, res, 500, 'No se pudo eliminar el registro')
  }
})

module.exports = router
