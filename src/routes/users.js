const express = require('express')
const multer = require('multer')
const cloudinary = require('cloudinary')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const response = require('../response')
const router = express.Router()
const Model = require('../models/users')
const AuthModel = require('../models/auths')
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
        coverPhotoId: '',
        description: '',
        followedPeople: [],
        likedPost: [],
        name: req.body.name,
        profilePhotoUrl: '',
        profilePhotoId: ''
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

//Enviamos la información de un usuario por medio del contenido del token ID
router.get('/', async (req, res) => {
  if (req.query.getProfile) {
    try {
      if (!req.headers.authorization) {
        response.error(req, res, 400, 'No JWT provided')
      }
      const authHeader = req.headers.authorization
      const token = authHeader.split(' ')[1]

      const decodedUser = jwt.verify(token, secret)
      const user = await Model.findById(decodedUser.user.user._id)
      response.success(req, res, 200, user)
    } catch (error) {
      response.error(req, res, 500, error.message)
    }
  }
  if (req.query.name) {
    try {
      const name = req.query.name.toLowerCase()
      const users = await Model.find()
      const filterUsers = users.filter((user) => {
        if (user.name.toLowerCase().includes(name)) {
          return user
        }
      })
      response.success(req, res, 200, filterUsers)
    } catch (error) {
      response.error(req, res, 500, error.message)
    }
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = await Model.findById(req.params.id)
    response.success(req, res, 200, user)
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
    response.error(req, res, 500, error.message)
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

      if (user._id) {
        const { files } = req
        const { coverPhoto, profilePhoto } = files

        if (req.body.name) {
          user.name = req.body.name
        }

        if (req.body.description) {
          user.description = req.body.description
        }

        if (profilePhoto) {
          if (user.profilePhotoId) {
            await cloudinary.v2.uploader.destroy(user.profilePhotoId)
          }
          const cloudUpload = await cloudinary.v2.uploader.upload(
            `${__dirname}/../../uploads/${profilePhoto[0].filename}`
          )

          user.profilePhotoUrl = cloudUpload.url
          user.profilePhotoId = cloudUpload.public_id
        }

        if (coverPhoto) {
          if (user.coverPhotoId) {
            await cloudinary.v2.uploader.destroy(user.coverPhotoId)
          }
          const cloudUpload = await cloudinary.v2.uploader.upload(
            `${__dirname}/../../uploads/${coverPhoto[0].filename}`
          )
          user.coverPhotoUrl = cloudUpload.url
          user.coverPhotoId = cloudUpload.public_id
        }

        await user.save()

        if (profilePhoto) {
          fs.unlink(
            `${__dirname}/../../uploads/${profilePhoto[0].filename}`,
            (error) => {
              if (error) {
                console.log(error)
              } else {
                console.log('Imagen eliminada')
              }
            }
          )
        }

        if (coverPhoto) {
          fs.unlink(
            `${__dirname}/../../uploads/${coverPhoto[0].filename}`,
            (error) => {
              if (error) {
                console.log(error)
              } else {
                console.log('Imagen eliminada')
              }
            }
          )
        }
        res.status(200).send(user)
      } else {
        res.status(500).send('No se encontró usuario con ese id')
      }
    } catch (error) {
      response.error(req, res, 500, error.message)
    }
  }
)

router.patch('/', async (req, res) => {
  try {
    if (req.body.userId && req.body.toFollow) {
      const user = await Model.findById(req.body.userId)
      const validationUser = user.followedPeople.find(
        (el) => el.toString() === req.body.toFollow
      )
      if (!validationUser) {
        //Follow
        user.followedPeople.push(req.body.toFollow)
        user.save()
        response.success(req, res, 200, user.followedPeople)
      } else {
        //unfollow
        const newFollowed = user.followedPeople.filter(
          (el) => el.toString() !== req.body.toFollow
        )
        user.followedPeople = newFollowed
        user.save()
        response.success(req, res, 200, user.followedPeople)
      }
    } else {
      response.error(req, res, 500, 'No id sended')
    }
  } catch (error) {
    response.error(req, res, 500, error.message)
  }
})

module.exports = router
