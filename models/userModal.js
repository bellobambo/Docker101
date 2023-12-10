const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username : {
        type : String,
        require : [true, 'User must Have a Username'],
        unique : true
    },
    password : {
        type : String,
        required : [true, 'User must Have a Password'],
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User