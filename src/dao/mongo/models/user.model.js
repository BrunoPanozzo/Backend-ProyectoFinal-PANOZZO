const mongoose = require('mongoose');
const { USER } = require('../../../config/policies.constants');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
    email: {
        type: String,
        unique: true
    },
    password: String,
    rol: {
        type: String,
        default: USER
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    documents: {
        type: [
            {
                name: String,  //nombre del documento
                reference: String  //link al documento
            },
        ],
        default: [],
    },
    last_connection: {
        type: Date  //ultimo login/logout
    }
})

module.exports = mongoose.model('User', userSchema, 'users');