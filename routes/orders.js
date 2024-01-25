const express = require('express');
const router = express.Router();
const { Order } = require('../models/order');
const { OrderItem } = require('../models/orderItem');
const { validateToken, checkAdmin } = require('../helper/jwt');
const { Payment } = require('../models/payment');

router.get(`/`, checkAdmin, async (req,res) => {
    const ordersList = await Order.find().populate('user', 'name').populate({
        path: 'orderItems',
        select: 'quantity',
        populate: {
            path: 'product',
            select: 'name price'
        },
    }).sort({'dateOrdered': 1});

    if(!ordersList) {
        res.status(500).json({success: false});
    }
    res.send(ordersList);
});

router.get(`/:id`, validateToken, async (req,res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name').populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            select: 'name price'
        },
    });

    if(!order) {
        res.status(500).json({success: false});
    }
    res.send(order);
});

router.post(`/`, validateToken, async (req, res) => {
    if(!req.body || !req.body.orderItems || !req.body.paymentMethod) {
        console.log(req.body.orderItems)
        return res.status(400).send('Order cannot be created');
    }

    const orderItemsIDs = await Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }));

    const totalPrices = await Promise.all(orderItemsIDs.map( async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');

        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))


    const totalPrice = totalPrices.reduce((a,b) => a + b, 0);

    const newPayment = new Payment({
        paymentMethod: req.body.paymentMethod
    });
    const paymentMethodID = await newPayment.save().then(newPayment => newPayment._id);


    let order = new Order({
        orderItems: orderItemsIDs,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        payment: paymentMethodID,
        totalPrice: totalPrice,
        user: req.body.user
    });

    order = await order.save();

    if(!order) {
        return res.status(400).send('Order cannot be created');
    }

    res.status(200).send(order);
});

router.put('/:id',checkAdmin, async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    );
    
    if(!order) {
        res.status(500).send('Order cannot be updated!');
    } else {
        res.status(200).send(order);
    }
});

router.delete('/:id',checkAdmin, async (req, res) => {
    let order = await Order.findByIdAndDelete(req.params.id);

    if (order) {
        await (order.orderItems.map(async orderItem => {
        let orderI = await OrderItem.findByIdAndDelete(orderItem);

        if (!orderI) {
            return res.status(404).json({ success: false, message: "Error on deleting Order Items" });
        }
        }));

        let payment = await Payment.findByIdAndDelete(order.payment);

        if (!payment) {
            return res.status(404).json({ success: false, message: "Error on deleting Payment" });
        }
        

        return res.status(200).json({ success: true, message: "Order is deleted" });
    } else {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

});

router.get('/get/totalsales',checkAdmin, async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: {$sum: '$totalPrice'}}}
    ]);

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated');

    }
    res.status(200).send({totalSales: totalSales.pop().totalsales});
});

router.get(`/get/count`,checkAdmin, async (req,res) => {
    const orderCount = await Order.countDocuments();
    
    if(!orderCount) {
        res.status(500).json({success: false});
    }
    res.send({
        count: orderCount
    });

});

router.get(`/get/userorders/:userid`,validateToken, async (req,res) => {
    const userOrderList = await Order.find({user: req.params.userid}).populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            select: 'name price'
        },
        select: 'quantity'
    }).sort({'dateOrdered': 1});

    if(!userOrderList) {
        res.status(500).json({success: false});
    }
    res.send(userOrderList);
});


module.exports = router;