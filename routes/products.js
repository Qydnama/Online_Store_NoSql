const express = require('express');
const router = express.Router();
const { Product } = require('../models/product');
const { Category } = require('../models/category');
const mongoose = require('mongoose');
const multer = require('multer');
const { validateToken } = require('../helper/jwt');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',

}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');
        
        if(isValid) {
            uploadError = null;
        }
        
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.replace(' ','-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
})
  
const uploadOptions = multer({ storage: storage })

//filter by query parameters category or not
router.get(`/`, async (req,res) => {
    try {
        let filter = {}
        if (req.query.categories) {
            filter = {category: req.query.categories.split(',')};
        }
        const productList = await Product.find(filter).populate('category');

        if(!productList) {
            res.status(500).json({success: false});
        }
        res.send(productList);
    }
    catch (err) {
        return res.status(400).json({success: false, error: err.message});
    }
});

router.get(`/:id`, async (req,res) => {
    const productList = await Product.findById(req.params.id).populate('category');
    
    if(!productList) {
        res.status(500).json({success: false});
    }
    res.send(productList);
});



router.post(`/`,validateToken, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);

    if (!category) {
        return res.status(400).json({success: false, error: "Indefined Category"});
    }

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request');
    
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        isFeatured: req.body.isFeatured
    });

    if(!product) {
        return res.status(400).send('Product cannot be created');
    }

    product = await product.save();

    return res.status(200).send(product);
});

router.put('/:id',validateToken , async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid ID');
    }

    const category = await Category.findById(req.body.category);

    if (!category) {
        return res.status(400).json({success: false, error: "Indefined Category"});
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    ).populate('category');

    if (product) {
        res.status(200).send(product)
    }
    else {
        return res.status(404).json({ success: false, error: "Invalid ID type" });
    }
});

router.delete('/:id', validateToken, async (req, res) => {
    let product = await Product.findByIdAndDelete(req.params.id);

    if (product) {
        return res.status(200).json({ success: true, message: "Product is deleted" });
    } else {
        return res.status(404).json({ success: false, message: "Product not found" });
    }
});

//count of produts
router.get(`/get/count`, async (req,res) => {
    const productCount = await Product.countDocuments();
    
    if(!productCount) {
        res.status(500).json({success: false});
    }
    res.send({
        count: productCount
    });

});

//filter by only featured + you can output sertain number of them
router.get(`/get/featured/:count?`, async (req,res) => {
    const count = req.params.count ? req.params.count : 0;
    const product = await Product.find({isFeatured: true}).limit(count);

    if(!product) {
        res.status(500).json({success: false});
    }
    res.send(product);


})



module.exports = router;