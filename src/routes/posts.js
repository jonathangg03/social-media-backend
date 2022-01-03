const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()
const Model = require('../models/posts')
const response = require('../response')
const { host, port } = require('../config')

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

//Traemos un post por medio de ID de usuario, para poder devolverlo al loguearnos
router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(500).send('No se ingresó un id')
    } else {
      const userPost = await Model.find({
        user: req.params.id
      }).populate('user')
      response.success(req, res, 200, userPost)
    }
  } catch (error) {
    response.error(req, res, 500, error.message)
  }
})

//Enviamos un elemento a posts
router.post('/:id', upload.single('postImage'), async (req, res) => {
  try {
    if (!req.params.id) {
      throw Error('No se ingresó id')
    } else {
      const newPost = new Model({
        content: req.body.content,
        // imageUrl: `${host}:${port}/uploads/${req.file.originalname || ''}`,
        likes: [],
        user: req.params.id,
        date: new Date()
      })

      await newPost.save()
      res.status(201).send(newPost)
    }
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.patch('/:postId', upload.single('postImage'), async (req, res) => {
  try {
    if (!req.query.user) {
      throw Error('No se ingresó id')
    } else {
      const post = await Model.findById(req.params.postId)

      post.likes.push(!req.query.user)
      post.save()
      await newPost.save()
      res.status(201).send(newPost)
    }
  } catch (error) {
    res.status(500).send(error.message)
  }
})

module.exports = router
