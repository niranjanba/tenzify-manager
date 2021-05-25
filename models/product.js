const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    vendor:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor'
        }
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;