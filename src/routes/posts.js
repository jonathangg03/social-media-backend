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
  createPost,
  updatePost,
  deletePost
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

router.patch('/:postId', upload.single('postImage'), async (req, res, next) => {
  //Give a like
  const { query, params } = req
  const { postId } = params
  const { userId } = query
  try {
    const post = await updatePost({ postId, userId })
    response.success(req, res, 200, post)
  } catch (error) {
    next(error)
  }
})

router.delete('/:postId', async (req, res) => {
  try {
    const { params } = req
    const { postId } = params
    const deletedPost = await deletePost({ postId })
    console.log(`Post with ID ${deletedPost._id} was deleted`)
    response.success(req, res, 200, 'Se eliminó el registro correctamente')
  } catch (error) {
    response.error(req, res, 500, 'No se pudo eliminar el registro', error)
  }
})

module.exports = router
