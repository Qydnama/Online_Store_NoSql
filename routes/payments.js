const express = require('express');
const router = express.Router();
const { Payment } = require('../models/payment');
const { validateToken } = require('../helper/jwt');

router.get(`/`, async (req, res) => {
    const paymentList = await Payment.find();
    
    return res.status(200).json(paymentList);
});

router.get('/:id', async (req, res) => {
    const payment = await Payment.findById(req.params.id);
    
    if(!payment) {
        res.status(500).json({success: false});
    } else {
        res.status(200).send(payment);
    }
})


router.post(`/`,validateToken, async (req, res) => {
    let payment = new Payment({
        order: req.body.order,
        paymentMethod: req.body.paymentMethod,
    });

    payment = await payment.save();

    res.status(200).send(payment);
});

router.put('/:id',validateToken, async (req, res) => {
    const payment = await Payment.findByIdAndUpdate(
        req.params.id,
        {
            order: req.body.order,
            paymentMethod: req.body.paymentMethod,
        },
        { new: true }
    );
    
    if(!payment) {
        res.status(500).json({success: false});
    } else {
        res.status(200).send(payment);
    }
});

// api/v1/id
router.delete('/:id',validateToken, async (req, res) => {
    let payment = await Payment.findByIdAndDelete(req.params.id);

    if (payment) {
        return res.status(200).json({ success: true, message: "payment is deleted" });
    } else {
        return res.status(404).json({ success: false, message: "payment not found" });
    }
});



module.exports = router;