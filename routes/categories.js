const express = require('express');
const router = express.Router();
const {Category} = require('../models/category');
const { validateToken, checkAdmin } = require('../helper/jwt');

router.get(`/`, async (req, res) => {
        const categoryList = await Category.find();
        
        return res.status(200).json(categoryList);
});

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    
    if(!category) {
        res.status(500).json({success: false});
    } else {
        res.status(200).send(category);
    }
})


router.post(`/`,checkAdmin, async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    category = await category.save();

    res.status(200).send(category);
});

router.put('/:id',checkAdmin, async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        { new: true }
    );
    
    if(!category) {
        res.status(500).json({success: false});
    } else {
        res.status(200).send(category);
    }
});

// api/v1/id
router.delete('/:id',checkAdmin, async (req, res) => {
    let category = await Category.findByIdAndDelete(req.params.id);

    if (category) {
        return res.status(200).json({ success: true, message: "Category is deleted" });
    } else {
        return res.status(404).json({ success: false, message: "Category not found" });
    }
});



module.exports = router;