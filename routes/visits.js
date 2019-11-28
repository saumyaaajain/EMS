const express = require('express')
const router = express.Router()
const RateLimit = require('express-rate-limit')
const mongoose = require('mongoose')
const stringCapitalizeName = require('string-capitalize-name')

const Visit = require('../models/visit')
const User = require('../models/user')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'help.emstrial@gmail.com', // Your email id
    pass: 'ABC@1234' // Your password
  }
})

// Attempt to limit spam post requests for inserting data
const minutes = 5
const postLimiter = new RateLimit({
  windowMs: minutes * 60 * 1000, // milliseconds
  max: 100, // Limit each IP to 100 requests per windowMs
  delayMs: 0, // Disable delaying - full speed until the max limit is reached
  handler: (req, res) => {
    res.status(429).json({ success: false, msg: `You made too many requests. Please try again after ${minutes} minutes.` })
  }
})

// Visit.collection.drop()

// READ (ONE)
router.get('/:id', (req, res) => {
  Visit.findOne({ _id: req.params.id }).populate({ path: 'host', model: User }).populate({ path: 'visitor', model: User }).exec((err, visits) => {
    if (err) {
      console.log(err)
      res.status(404).json({ success: false, msg: 'No such visit.' })
    } else {
      res.json(visits)
    }
  })
})

// READ (ALL)
router.get('/', (req, res) => {
  Visit.find({status: ['meeting_under_progress', 'meeting_created']}).populate({ path: 'host', model: User }).populate({ path: 'visitor', model: User })
    .then((result) => {
      res.json(result)
    })
    .catch((err) => {
      res.status(500).json({ success: false, msg: `Something went wrong. ${err}` })
    })
})

// CREATE
router.post('/', postLimiter, (req, res) => {
  const newVisit = new Visit({
    host: req.body.host,
    visitor: req.body.visitor,
    address: req.body.address
  })

  newVisit.save()
    .then((result) => {
      Visit.findOne({ _id: result._id }).populate({ path: 'host', model: User }).populate({ path: 'visitor', model: User }).exec((err, visit) => {
        if (err) {
          console.log(err)
          res.status(404).json({ success: false, msg: 'No such visit.' })
        } else {
          const mailOptions = {
            from: '"Saumya Jain" <happyme12341@gmail.com>', // sender address
            to: visit.host.email, // list of receivers
            subject: 'Meeting Details', // Subject line
            // text: text //, // plaintext body
            html: '<head><link href="https://fonts.googleapis.com/css?family=Fresca" rel="stylesheet"> </head>' + '<body style="color: cornflowerblue; font-family: Fresca">' + '<h1><strong>Hello! Your Meeting Details are here!</strong></h1>' +
                '<h2>Visitor Name:' + visit.visitor.name + ' </h2>' + '<h2>Visitor Phone: ' + visit.visitor.phone + '</h2>' + '<h2>Address: ' + visit.address + '</h2>' + '' +
                '</body>'
          }
          transporter.sendMail(mailOptions).then((result) => {
            console.log('Successfully Sent Email!')
            res.json({
              success: true,
              msg: 'Successfully added!',
              result: visit
            })
          }).catch((err) => {
            console.log('Could not send Email')
            res.status(400).json({ success: false, msg: 'Could not send Email'})
          })
        }
      })
    //  sendEmail("id")
    })
    .catch((err) => {
      console.log(err)
      if (err.errors) {
        if (err.errors.host) {
          res.status(400).json({ success: false, msg: err.errors.host.message })
          return
        }
        if (err.errors.visitor) {
          res.status(400).json({ success: false, msg: err.errors.visitor.message })
          return
        }
        if (err.errors.status) {
          res.status(400).json({ success: false, msg: err.errors.status.message })
          return
        }
        // Show failed if all else fails for some reasons
        res.status(500).json({ success: false, msg: `Something went wrong. ${err}` })
      }
    })
})

// UPDATE
router.put('/:id', (req, res) => {
  const updatedVisit = {
    host: req.body.host,
    visitor: req.body.visitor,
    status: req.body.status,
    address: req.body.address
  }

// if req.body.status = completed current time is checko-out time, last0updated time: check-in time
  Visit.findOneAndUpdate({ _id: req.params.id }, updatedVisit, { runValidators: true, context: 'query' })
    .then((oldResult) => {
      Visit.findOne({ _id: req.params.id }).populate({ path: 'host', model: User }).populate({ path: 'visitor', model: User })
        .then((newResult) => {
          console.log(newResult._id)
          if(newResult.status==='meeting_completed'){
            const visitorMailOptions = {
              from: '"Saumya Jain" <happyme12341@gmail.com>', // sender address
              to: newResult.visitor.email, // list of receivers
              subject: 'Meeting Attended!', // Subject line
              // text: text //, // plaintext body
              html: '<head><link href="https://fonts.googleapis.com/css?family=Fresca" rel="stylesheet"> </head>' + '<body style="color: cornflowerblue; font-family: Fresca">' + '<h1><strong>Thank you for attending the meeting. The meeting details were:</strong></h1>' +
                   '' + '<h2>Host Name: ' + newResult.host.name + '</h2>' + '<h2>Host Phone: ' + newResult.host.phone + '</h2>' + '<h2>Check-in Time: ' + oldResult.updatedAt + '</h2>' + '<h2>Check-out Time: ' + newResult.updatedAt + '</h2>' + '<h2>Address: ' + newResult.address + '</h2>' +
                  '</body>'
            }
            const hostMailOptions = {
              from: '"Saumya Jain" <happyme12341@gmail.com>', // sender address
              to: newResult.host.email, // list of receivers
              subject: 'Meeting Attended!', // Subject line
              // text: text //, // plaintext body
              html: '<head><link href="https://fonts.googleapis.com/css?family=Fresca" rel="stylesheet"> </head>' + '<body style="color: cornflowerblue; font-family: Fresca">' + '<h1><strong>Thank you for attending the meeting. The meeting details were:</strong></h1>' +
                  '<h2>Visitor Name:' + newResult.visitor.name + ' </h2>' + '<h2>Visitor Phone: ' + newResult.visitor.phone + '</h2>' + '' + '<h2>Check-in Time: ' + oldResult.updatedAt + '</h2>' + '<h2>Check-out Time: ' + newResult.updatedAt + '</h2>' + '<h2>Address: ' + newResult.address + '</h2>' +
                  '</body>'
            }
            transporter.sendMail(visitorMailOptions).then((result) => {
              console.log('Successfully Sent Email!')
              transporter.sendMail(hostMailOptions).then((result) => {
                console.log('Successfully Sent Email!')
                res.json({
                  success: true,
                  msg: 'Successfully updated!',
                  result: {
                    _id: newResult._id,
                    host: newResult.host,
                    visitor: newResult.visitor,
                    status: newResult.status,
                    address: newResult.address
                  }
                })
              }).catch((err) => {
                console.log('Could not send Email')
                res.status(400).json({ success: false, msg: 'Could not send Email'})
              })
            }).catch((err) => {
              console.log('Could not send Email')
              flag = 0;
              res.status(400).json({ success: false, msg: 'Could not send Email'})
            })
          }

        })
        .catch((err) => {
          res.status(500).json({ success: false, msg: `Something went wrong. ${err}` })
        })

    })
    .catch((err) => {
      if (err.errors) {
        if (err.errors.name) {
          res.status(400).json({ success: false, msg: err.errors.name.message })
          return
        }
        if (err.errors.email) {
          res.status(400).json({ success: false, msg: err.errors.email.message })
          return
        }
        if (err.errors.age) {
          res.status(400).json({ success: false, msg: err.errors.age.message })
          return
        }
        if (err.errors.gender) {
          res.status(400).json({ success: false, msg: err.errors.gender.message })
          return
        }
        // Show failed if all else fails for some reasons
        res.status(500).json({ success: false, msg: `Something went wrong. ${err}` })
      }
    })
})

// DELETE
router.delete('/:id', (req, res) => {
  Visit.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.json({
        success: true,
        msg: 'It has been deleted.',
        result: {
          _id: result._id,
          host: result.host,
          visitor: result.visitor,
          status: result.status,
          address: result.address
        }
      })
    })
    .catch((err) => {
      res.status(404).json({ success: false, msg: 'Nothing to delete.' })
    })
})

module.exports = router
