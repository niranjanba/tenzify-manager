if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const multer = require('multer');
const { cloudinary, storage } = require('./cloudinary');
const upload = multer({ storage });
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { isLoggedIn } = require('./middleware');

const MongoDBStore = require('connect-mongo');

const app = express();

//sku generator
const skuGen = require('./public/js/skuGenerator');

//Models 
const Vendor = require('./models/vendor');
const Product = require('./models/product');
const User = require('./models/user');

//Category hardcodded
const categories = ['Baby products','Beauty and Fashion','Clothing','Covid Essentials','Daily Essentials','Handmade','Home Decor','Nursery']

dotenv.config();

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/tenzifyManager';

mongoose.connect(dbUrl,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
    () => {
    console.log('connected to DB');
    })

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret: process.env.SECRET,
    touchAfter: 24 * 60 * 60
});

store.on('error', function (e) {
    console.log('session store error', e);
})

const sessionConfig = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(express.json({ limit: '1mb' }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
})


app.get('/',isLoggedIn, async (req, res) => {
    const vendors = await Vendor.find();
    res.render('index',{vendors});
})

// app.get('/register', async (req, res) => {
//     const user = new User({ name: 'Niranjan B A',email: 'admin@tenzify.com' });
//     const newUser = await User.register(user, );
//     res.send(newUser);
// })

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
})

app.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
})

app.delete('/vendor/:id',isLoggedIn, async (req, res) => {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    for (image of vendor.images) {
        cloudinary.uploader.destroy(image.filename);
    }
    res.redirect('/');
})

app.get('/vendor/add-vendor',isLoggedIn, (req, res) => {
    res.render('addVendor');
})

app.post('/add-vendor',isLoggedIn,upload.array('image') ,async (req, res) => {
    const vendor = new Vendor(req.body);
    vendor.images = req.files.map((f)=>({url: f.path, filename: f.filename}))
    await vendor.save();
    res.redirect(`/view-vendor/${vendor._id}`);
})

app.get('/view-vendor/:id',isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const products = await Vendor.findById(id).populate('products');
    const vendor = await Vendor.findById(id);
    const allProducts = products.products
    res.render('viewVendor', { vendor, products: allProducts, categories });
})

app.get('/view-vendor/edit/:id',isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    res.render('editVendor', {vendor});
    
})

app.put('/view-vendor/edit/:id',isLoggedIn,upload.array('image'), async (req, res) => {
    const { id } = req.params;
    const vendor = await Vendor.findByIdAndUpdate(id, { ...req.body });
    const img = req.files.map(f => ({ url: f.path, filename: f.filename }));
    vendor.images.push(...img)
    await vendor.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        await vendor.updateOne({ $pull: { images: {filename: { $in: req.body.deleteImages } }} });
    }
    res.redirect(`/view-vendor/${id}`)
})

//DELETE PRODUCTS   
app.delete('/vendor/:id/product/:productId',isLoggedIn, async (req, res) => {
    const { id, productId } = req.params;
    await Vendor.findByIdAndUpdate(id, { $pull: { products: productId } });
    await Product.findByIdAndDelete(productId);
    res.redirect(`/view-vendor/${id}`);
})

//EDIT PRODUCTS
app.put('/product/:id',isLoggedIn, async (req, res) => {
    const { id } = req.params;
    // const { name, price, category, quantity } = req.body;
    const product = await Product.findByIdAndUpdate(id, {...req.body});
    res.end();
})

//View all product

app.get('/view-all-products',isLoggedIn, async (req, res) => {
    const products = await Product.find();
    res.render('allProducts', { products, categories });
})

app.post('/view-all-products',isLoggedIn, async (req, res) => {
    const { category } = req.body;
    const products = await Product.find({ category });
    res.render('allProducts', { products, categories });
})



//search 

app.get('/search',isLoggedIn,async (req, res) => {
    const user = await Vendor.find({ phone: req.query.value });
    const result = [];
    user.map(f => {
        let obj = {
            vendor: {
                id: f._id,
                name: f.name,
                store: f.storeName
            }
        }
        result.push(obj);
    });
    res.send(result);
})

app.get('/result/:id',isLoggedIn, (req, res) => {
    res.send(req.params)
})

app.get('/view-vendor/:id/product/new',isLoggedIn, (req, res) => {
    const { id } = req.params;
    res.render('addProduct',{id, categories});
})
app.post('/view-vendor/:id/product',isLoggedIn,async (req, res) => {
    const { id } = req.params;
    const { name, price, category, quantity } = req.body;
    const sku = skuGen(name, category, id);
    const vendor = await Vendor.findById(id);
    const product = new Product({ name, price, category, sku, quantity });
    vendor.products.push(product);
    product.vendor = vendor;
    await vendor.save();
    await product.save();
    res.redirect(`/view-vendor/${id}`);
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('SERVER IS UP AND RUNNING!');
})