const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    products: {
        type: [
            { 
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },                
                quantity: Number,
            },
        ],
        default: [],
    },
})

module.exports = mongoose.model('Cart', cartSchema, 'carts');