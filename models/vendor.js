const mongoose = require('mongoose');
const Product = require('./product');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        uppercase: true
    },
    email: {
        type: String,
        required: true,
    },
    storeName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    gstin: {
        type: String,
        required: true,
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    images: [
        {
            url: String,
            filename: String,
        }
    ],
    paid: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    bank: {
        accountName: {
            type: String,
            required: true,
        },
        accountBank: {
            type: String,
            required: true
        },
        accountIFSC: {
            type: String,
            required: true
        },
        accountNumber: {
            type: String,
            required: true
        }
    }
});

vendorSchema.post('findOneAndDelete', async function (vendor) {
    if (vendor.products) {
        Product.deleteMany({ _id: { $in: vendor.products } });
    }
})

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;