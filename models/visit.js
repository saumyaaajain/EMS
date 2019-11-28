const mongoose = require('mongoose')
const unique = require('mongoose-unique-validator')
const validate = require('mongoose-validator')
const Schema = require('mongoose').Schema

const nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [0, 40],
    message: 'Name must not exceed {ARGS[1]} characters.'
  })
]

const emailValidator = [
  validate({
    validator: 'isLength',
    arguments: [0, 40],
    message: 'Email must not exceed {ARGS[1]} characters.'
  }),
  validate({
    validator: 'isEmail',
    message: 'Email must be valid.'
  })
]

const ageValidator = [
  // TODO: Make some validations here...
]

const genderValidator = [
  // TODO: Make some validations here...
]

// Define the database model
const VisitSchema = new Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    default: 'meeting_created',
    enum: ['meeting_created', 'meeting_under_progress', 'meeting_completed']
  },
  address: {
    type: String,
    required: true
  }
})

VisitSchema.set('timestamps', true)

const Visit = module.exports = mongoose.model('visit', VisitSchema)
