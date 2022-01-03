const express = require('express')
const multer = require('multer')
const path = require('path')
const response = require('../response')
const router = express.Router()
const Model = require('../models/users')
const AuthModel = require('../models/auths')
const jwt = require('jsonwebtoken')
const { host, port, secret } = require('../config')

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

//Enviamos un elemento a users y auths
router.post('/', async (req, res) => {
  const userVerification = await AuthModel.findOne({ email: req.body.email })
  if (userVerification) {
    response.error(req, res, 500, 'Ya existe un usuario usando este correo')
  } else {
    try {
      const newUser = new Model({
        coverPhotoUrl: '',
        description: '',
        followedPeople: [],
        likedPost: [],
        name: req.body.name,
        profilePhotoUrl: ''
      })
      await newUser.save()

      const password = await newUser.hashPassword(req.body.password)
      const newUserAuth = new AuthModel({
        email: req.body.email,
        password: password,
        user: newUser._id
      })
      await newUserAuth.save()

      response.success(req, res, 201, newUser)
    } catch (error) {
      response.error(req, res, 500, error.message, error)
    }
  }
})

//Traemos usuairos por nombre
// router.get('/', async (req, res) => {
//   try {
//     const users = await Model.find()
//     // const filterUsers = users.filter((user) => {
//     //   if (user.name.toLowerCase().includes(req.query.name.toLowerCase())) {
//     //     return user
//     //   }
//     // })
//     res.status(200).send(users)
//   } catch (error) {
//     res.status(500).send(error)
//   }
// })

//Enviamos la información de un usuario por medio del contenido del token ID
router.get('/', async (req, res) => {
  try {
    if (!req.headers.authorization) {
      response.error(req, res, 400, 'No JWT provided')
    }
    const authHeader = req.headers.authorization
    const token = authHeader.split(' ')[1]

    const decodedUser = jwt.verify(token, secret)
    response.success(req, res, 200, decodedUser.user)
  } catch (error) {
    response.error(req, res, 500, error.message)
  }
})

router.delete('/:userId', async (req, res) => {
  try {
    await Model.findByIdAndDelete(req.params.userId)
    await AuthModel.deleteOne({
      user: req.params.userId
    })
    res.status(200).send('El usuario fue eliminado exitosamente')
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.patch(
  '/:userId',
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const user = await Model.findById(req.params.userId)
      if (user.id) {
        const { files } = req
        const { coverPhoto, profilePhoto } = files
        if (profilePhoto[0].size) {
          user.profilePhotoUrl = `${host}:${port}/uploads/${req.files.profilePhoto[0].originalname}`
        }
        if (coverPhoto[0].size) {
          user.coverPhotoUrl = `${host}:${port}/uploads/${req.files.coverPhoto[0].originalname}`
        }
        res.status(200).send(user)
      } else {
        res.status(500).send('No se encontró usuario con ese id')
      }
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
)

module.exports = router
