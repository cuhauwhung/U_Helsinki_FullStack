
require('dotenv').config('../.env')

const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({

    name: {
        type: String,
        minlength: 3,
        required: true,
        unique: true
    },

    number: {
        type: String,
        minlength: 2,
        required: true
    }

})

var uniqueValidator = require('mongoose-unique-validator');
personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.__v
    }
})



module.exports = mongoose.model('Person', personSchema)