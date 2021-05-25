const Product = require('./models/product');
const mongoose = require('mongoose');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/tenzifyManager',
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
    console.log('connected to DB');
    })

// const p = new Product({
//     name: 'Apple',
//     category: 'Fruit',
//     price: 100,
//     sku: 'AP-001',
//     quantity: 4
// })
// p.save().then((p) => {
//     console.log(p);
// })
//     .catch(err => {
//         console.log(err);
// })

// const newUser = [
//     {
//         name: 'T-shirts',
//         store: 'Fashion'
//     },
//     {
//         name: 'Hoodie',
//         store: 'm-Fashion'
//     },
//     {
//         name: 'Sarees',
//         store: 'Lakshmi'
//     }
//     ,
//     {
//         name: 'pant for men',
//         store: 'Pant store'
//     }
//     ]

// User.insertMany(newUser)
//     .then(data => {
//         console.log(data);
//     })
//     .catch(err => {
//         console.log(err);
// })

// User.find({ $text: { $search: 'pant for women' } }, { score: { $meta: 'textScore' } }).sort({score: {$meta: 'textScore'}})
//     .then(data => console.log(data));
