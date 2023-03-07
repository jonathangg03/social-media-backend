const express = require('express')
const multer = require('multer')
const cloudinary = require('cloudinary')
const path = require('path')
const fs = require('fs')
const response = require('../response')
const router = express.Router()
const Model = require('../models/users')
const boom = require('@hapi/boom')
const AuthModel = require('../models/auths')
const {
  createUser,
  getUsers,
  getOneUser,
  deleteUser,
  followPeople
} = require('../services/users')
const { secret } = require('../config')

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

//Enviamos un elemento a users y auths
router.post('/', async (req, res, next) => {
  try {
    const { body } = req
    const { name, email, password } = body
    const newUser = await createUser({ name, email, password })
    response.success(req, res, 201, newUser)
  } catch (error) {
    next(error)
  }
})

//We send to the requester the user information by token id
router.get('/', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
      ? req.headers.authorization
      : null
    const nameQuery = req.query.name ? req.query.name : null
    console.log(req.params)
    const getAllUsers = req.query.getAllUsers ? true : false
    const users = await getUsers({ authHeader, nameQuery, getAllUsers })
    response.success(req, res, 200, users)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const user = await getOneUser({ id })
    response.success(req, res, 200, user)
  } catch (error) {
    next(error)
  }
})

router.delete('/:userId', async (req, res) => {
  const id = req.params.userId
  try {
    const deletedUser = await deleteUser({ id })
    console.log(`User ${deletedUser._id} has been deleted`)
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

router.patch('/', async (req, res, next) => {
  //Follow or unfollow
  const { body } = req
  const { userId, toFollow } = body
  try {
    const followedPeople = await followPeople({ userId, toFollow })
    response.success(req, res, 200, followedPeople)
  } catch (error) {
    next(error)
  }
})

module.exports = router
