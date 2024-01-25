const express = require('express');
const router = express.Router();
const { User } = require('../models/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateToken, checkAdmin } = require('../helper/jwt');


router.get(`/`, checkAdmin, async (req,res) => {
    const userList = await User.find().select("-passwordHash");

    if(!userList) {
        res.status(500).json({success: false});
    }
    res.send(userList);
});

router.get(`/:id`, validateToken, async (req,res) => {
    const userList = await User.findById(req.params.id).select("-passwordHash");
    
    if(!userList) {
        res.status(500).json({success: false});
    }
    res.send(userList);
});

router.post(`/register`, async (req, res) => {
    const userExists = await User.findOne({email: req.body.email});

    if (userExists && userExists.email == req.body.email) {
        return res.status(400).send('Already have user with this email');
    }

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });
    
    if(!user) {
        return res.status(400).send('User cannot be created');
    }

    user = await user.save();



    res.status(200).send(user);
});

router.post('/login', async (req,res) => {
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;
    
    if (!user || !req.body.password) {
        return res.status(400).send('The user not found or wrong password');
    }

    if (user.email !== req.body.email) {
        return res.status(400).send('Wrong Email');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1h'}
        );

        res.cookie("token", token, {
            // httpOnly: true,
            // sameSite: 'None', 
            // secure: true
        })



        return res.status(200).send({user: user.email, token: token, isAdmin: user.isAdmin});
    } else {
        return res.status(400).send('Password is wrong!');
    }
});

router.put('/:id', validateToken, async (req,res) => {
    const userExists = await User.findById(req.params.id);

    if (!userExists) {
        return res.status(400).send('The user not found');
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            phone: req.body.phone,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        },
        { new: true }
    );


    if (user) {
        res.status(200).send(user)
    }
    else {
        return res.status(404).json({ success: false, error: "Error while updating user" });
    } 
});

router.get(`/get/count`, checkAdmin, async (req,res) => {
    const userCount = await User.countDocuments();
    
    if(!userCount) {
        res.status(500).json({success: false});
    }
    res.send({
        count: userCount
    });
});

router.get(`/get/:email`,validateToken, async (req,res) => {
    const userList = await User.find({email: req.params.email});
    if(!userList || userList.length === 0) {
        return res.status(422).json({ success: false});
    } else {
        return res.status(200).send(userList);
    }
});

router.delete('/:id', checkAdmin, async (req, res) => {
    let user = await User.findByIdAndDelete(req.params.id);

    if (user) {
        return res.status(200).json({ success: true, message: "User is deleted" });
    } else {
        return res.status(404).json({ success: false, message: "User not found" });
    }
});



module.exports = router;