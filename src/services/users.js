const boom = require('@hapi/boom')
const AuthModel = require('../models/auths')
const UserModel = require('../models/users')

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

module.exports = {
  createUser
}
