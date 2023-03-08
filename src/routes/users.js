const express = require('express')
const multer = require('multer')
const path = require('path')
const response = require('../response')
const router = express.Router()
const {
  createUser,
  getUsers,
  getOneUser,
  deleteUser,
  followPeople,
  upadateProfile
} = require('../services/users')

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
    response.success(req, res, 200, 'El usuario fue eliminado exitosamente')
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
  async (req, res, next) => {
    try {
      const { params, body, files } = req
      const { userId } = params
      const { name, description } = body
      const user = await upadateProfile({ userId, name, description, files })
      response.success(req, res, 200, user)
    } catch (error) {
      next(error)
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
