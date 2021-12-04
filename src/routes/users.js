const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()
const Model = require('../models/users')
const AuthModel = require('../models/auths')
const { host, port } = require('../config')

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

//Enviamos un elemento a users y auths
router.post('/', async (req, res) => {
  try {
    const newUser = new Model({
      coverPhotoUrl: 'Este es un url',
      description: req.body.description,
      followedPeople: [],
      likedPost: [],
      name: req.body.name,
      profilePhotoUrl: 'Este es un url'
    })

    await newUser.save()

    const newUserAuth = new AuthModel({
      email: req.body.email,
      password: req.body.password,
      user: newUser._id
    })

    await newUserAuth.save()
    res.status(201).send(newUser)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

//Traemos usuairos por nombre
router.get('/', async (req, res) => {
  try {
    const users = await Model.find()
    const filterUsers = users.filter((user) => {
      if (user.name.toLowerCase().includes(req.query.name.toLowerCase())) {
        return user
      }
    })
    res.status(200).send(filterUsers)
  } catch (error) {
    res.status(500).send(error)
  }
})

//Traemos un usuario por medio de ID, para poder devolverlo al loguearnos
router.get('/:userId', async (req, res) => {
  try {
    const user = await Model.findById(req.params.userId)
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send(error)
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
