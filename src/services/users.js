const jwt = require('jsonwebtoken')
const boom = require('@hapi/boom')
const AuthModel = require('../models/auths')
const UserModel = require('../models/users')
const cloudinary = require('cloudinary')
const fs = require('fs')

const validate = async ({ name, email, password }) => {
  if (!email) {
    throw boom.badData('No email was sended')
  }

  if (!password) {
    throw boom.badData('No password was sended')
  }

  if (!name) {
    throw boom.badData('No name was sended')
  }

  let userVerification = {}

  try {
    userVerification = await AuthModel.findOne({ email })
  } catch {
    throw boom.internal('Internal error validating user')
  }

  if (userVerification !== null) {
    //If an email is already used, userVerification !== null, if email is not user userVerification === null
    throw boom.badData('Correo electrónico ya existe')
  }
}

const createUser = async ({ name, email, password }) => {
  await validate({ name, email, password })
  const newUser = new UserModel({
    coverPhotoUrl: '',
    coverPhotoId: '',
    description: '',
    followedPeople: [],
    likedPost: [],
    name: name,
    profilePhotoUrl: '',
    profilePhotoId: ''
  })
  const newUserId = newUser._id
  const hashedPassword = await newUser.hashPassword(password)
  const newAuthUser = new AuthModel({
    email: email,
    password: hashedPassword,
    user: newUserId
  })

  try {
    await newUser.save()
    await newAuthUser.save()
    /*
     * To do: If 1st save works, but 2nd didn't, first data sended has to be deleted
     */
  } catch (error) {
    boom.internal('Internal error server creating auth user')
  }

  return newUser
}

const getUsers = async ({ authHeader, nameQuery, getAllUsers }) => {
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1]
      const decodedUser = jwt.verify(token, secret)
      const user = await Model.findById(decodedUser.user.user._id)
      return user
    } catch (error) {
      throw boom.internal('Internal error server getting auth user')
    }
  }

  if (nameQuery) {
    try {
      const name = nameQuery.toLowerCase()
      const users = await UserModel.find()
      const filteredUsers = users.filter((user) => {
        if (user.name.toLowerCase().includes(name)) {
          return user
        }
      })

      /*
        ? IT HAS TO BE IMPROVED, WE CAN'T BRING ALL USERS EVERY TIME
      */
      return filteredUsers
    } catch (error) {
      throw boom.internal('Internal error server getting users')
    }
  }

  if (getAllUsers) {
    //Mostly used for developing
    const users = await UserModel.find()
    return users
  }

  throw boom.badRequest(
    'Bad request. Please, send a name or an Authorization Header'
  )
}

const getOneUser = async ({ id }) => {
  let user = {}
  try {
    user = await UserModel.findById(id)
  } catch (error) {
    throw boom.internal('Internal error finding user')
  }
  if (!user) {
    throw boom.badData('No user founded')
  }
  return user
}

const deleteUser = async ({ id }) => {
  if (!id) {
    throw boom.badData('No user specified to be deleted')
  }
  try {
    const deletedUser = await UserModel.findByIdAndDelete(id)
    await AuthModel.deleteOne({
      user: id
    })
    console.log(`User ${deletedUser._id} has been deleted`)
    return deletedUser
  } catch (error) {
    throw boom.internal('Internal error deleting user')
  }
}

const followValidation = ({ userId, toFollow }) => {
  if (!userId) {
    throw boom.badData('No user that follow was sended')
  }

  if (!toFollow) {
    throw boom.badData('No followed user was sended')
  }
}

const followPeople = async ({ userId, toFollow }) => {
  followValidation({ userId, toFollow })
  try {
    //Add userId to the array that is following to a person
    const user = await UserModel.findById(userId)
    const validatedUser = user.followedPeople.find(
      (el) => el.toString() === toFollow
    )
    if (!validatedUser) {
      //if the person to follow is not on the followedPople list
      //Follow
      user.followedPeople.push(toFollow) //we add him
      user.save()
      return user.followedPeople
    } else {
      //it him is not on the list, unfollow
      const newFollowed = user.followedPeople.filter(
        (el) => el.toString() !== toFollow
      )
      user.followedPeople = newFollowed
      user.save()
      return user.followedPeople
    }
  } catch (error) {
    throw boom.internal('Internal error following people', error)
  }
}

const upadateProfile = async ({ userId, name, description, files }) => {
  try {
    const user = await getOneUser({ id: userId })
    const { coverPhoto, profilePhoto } = files

    if (name) {
      user.name = name
    }

    if (description) {
      user.description = description
    }

    if (profilePhoto) {
      if (user.profilePhotoId) {
        await cloudinary.v2.uploader.destroy(user.profilePhotoId) //Delete profilePhoto if already exists
      }
      const cloudUpload = await cloudinary.v2.uploader.upload(
        `${__dirname}/../../uploads/${profilePhoto[0].filename}`
      )

      user.profilePhotoUrl = cloudUpload.url
      user.profilePhotoId = cloudUpload.public_id
    }

    if (coverPhoto) {
      if (user.coverPhotoId) {
        await cloudinary.v2.uploader.destroy(user.coverPhotoId) //Delete profilePhoto if already exists
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
            console.log('Delete image successfully')
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
            console.log('Delete image successfully')
          }
        }
      )
    }
    return user
  } catch (error) {
    throw boom.internal('Internal error updating profile', error)
  }
}

module.exports = {
  createUser,
  getUsers,
  getOneUser,
  deleteUser,
  followPeople,
  upadateProfile
}
