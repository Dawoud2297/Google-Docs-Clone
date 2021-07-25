const { Schema , model } = require('mongoose')

const Document = new Schema({
    _id : String,
    element : Object
})

module.exports = model('Google-DOCs',Document)