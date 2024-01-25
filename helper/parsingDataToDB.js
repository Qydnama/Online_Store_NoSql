// const faker = require('@faker-js/faker');
// const { category } = require('../models/category')

// const generatecategorys = (num) => {
//     const category = [];
  
//     for (let i = 0; i < num; i++) {
//       const name = faker.name.firstName();
//       const reviews = faker.lorem.sentences(3);
//       const location = faker.lorem.sentences(1);
//       const password = faker.datatype.number();
//       const email = faker.internet.email();
//       const category = faker.commerce.department();
//       const createdAt = faker.date.past();
  
//       category.push({
//         name,
//         reviews,
//         category,
//         ratings,
//         password,
//         category,
//         email,
//         location,
//         createdAt,
//       });
//     }
  
//     return category;
// };

// const category = generatecategorys(50);

// category.insertMany(category)
// .then(docs => console.log(`${docs.length} categorys have been inserted into the database.`))
// .catch(err => {
// console.error(err);
// console.error(`${err.writeErrors?.length ?? 0} errors occurred during the insertMany operation.`);
// });


const {faker} = require('@faker-js/faker');
const { Category } = require('../models/category');
const mongoose = require('mongoose');
const { Product } = require('../models/product');
const { User } = require('../models/user');
const { OrderItem } = require('../models/orderItem');
const { Order } = require('../models/order');
const { Payment } = require('../models/payment');

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { param } = require('../routes/products');

mongoose.connect("mongodb+srv://Qydnama:2005amandik@nosqlprojects.uega5q8.mongodb.net/?retryWrites=true&w=majority", { dbName: 'shop' });
const db = mongoose.connection;
db.on('error',(error) => console.log(error));
db.once('open', () => console.log('Connected to the Database'));


const generateCategory = (num) => {
    const category = [];
  
    for (let i = 0; i < num; i++) {
      const name = faker.commerce.product();
      const icon = faker.image.url();
      const color = faker.internet.color();

  
      category.push({
        name,
        icon,
        color
      });
    }
  
    return category;
};

const insertCategories = async () => {
    const category = generateCategory(37);

    try {
        const docs = await Category.insertMany(category)
        console.log(`${docs.length} users have been inserted into the database.`);
    } catch (err) {
        console.error(err);
        console.error(`${err.writeErrors?.length ?? 0} errors occurred during the insertMany operation.`);
    }
};

// insertCategories()

// const category = generateCategory(37);

// Category.insertMany(category)
// .then(docs => console.log(`${docs.length} categorys have been inserted into the database.`))
// .catch(err => {
// console.error(err);
// console.error(`${err.writeErrors?.length ?? 0} errors occurred during the insertMany operation.`);
// });









const generateProduct = async (num) => {
    const product = [];
    const existingCategories = await Category.find({}, '_id');
    const objectIdStrings = existingCategories.map(category => category._id.toString());

    for (let i = 0; i < num; i++) {
        const name = faker.commerce.productName();
        const description = faker.commerce.productDescription();
        const image = faker.image.url();
        const brand = faker.company.name();
        const price = faker.number.int({ min: 1, max: 5000 });
        const category = faker.helpers.arrayElement(objectIdStrings);
        const countInStock = faker.number.int({ min: 0, max: 255 });
        const isFeatured = faker.datatype.boolean(0.8);

        product.push({
            name,
            description,
            image,
            brand,
            price,
            category,
            countInStock,
            isFeatured
        });
    }

    return product;
};

const insertProducts = async () => {
    const products = await generateProduct(500);

    try {
        const docs = await Product.insertMany(products);
        console.log(`${docs.length} products have been inserted into the database.`);
    } catch (err) {
        console.error(err);
        console.error(`${err.writeErrors?.length ?? 0} errors occurred during the insertMany operation.`);
    }
};


// insertProducts();











const generateUser = async (num) => {
    const user = [];


    for (let i = 0; i < num; i++) {
        const name = faker.person.firstName();
        const email = faker.internet.exampleEmail({firstName: name});
        const passwordHash = bcrypt.hashSync("123", 10);
        const phone = faker.phone.number();
        const isAdmin = faker.datatype.boolean(0.1);
        const street = faker.location.street();
        const apartment = faker.location.streetAddress(false)
        const zip = faker.location.zipCode()
        const city = faker.location.city();
        const country = faker.location.country();

        user.push({
            name,
            email,
            passwordHash,
            phone,
            isAdmin,
            street,
            apartment,
            zip,
            city,
            country
        });
    }

    return user;
};

const insertUsers = async () => {
    const users = await generateUser(200);

    try {
        const docs = await User.insertMany(users);
        console.log(`${docs.length} users have been inserted into the database.`);
    } catch (err) {
        console.error(err);
        console.error(`${err.writeErrors?.length ?? 0} errors occurred during the insertMany operation.`);
    }
};


// insertUsers();





const generateOrderItems = async (num) => {
    const orderItem = [];
    const existingProducts = await Product.find({}, '_id');
    const objectIdStrings = existingProducts.map(product => product._id.toString());

    for (let i = 0; i < num; i++) {
        const product = faker.helpers.arrayElement(objectIdStrings);
        const quantity = faker.number.int({ min: 1, max: 30 });

        orderItem.push({
            product,
            quantity
        });
    }

    return orderItem;
};

const insertOrderItems = async () => {
    const orderItems = await generateOrderItems(2000);

    try {
        const docs = await OrderItem.insertMany(orderItems);
        console.log(`${docs.length} orderItems have been inserted into the database.`);
    } catch (err) {
        console.error(err);
        console.error(`${err.writeErrors?.length ?? 0} errors occurred during the insertMany operation.`);
    }
};


// insertOrderItems();








const generatePayments = async (num) => {
    const payment = [];
    const methods = ['cash','debit card','cryptocurrency','digital wallet','credit card'];


    for (let i = 0; i < num; i++) {
        const paymentMethod = faker.helpers.arrayElement(methods);
        // faker.setDefaultRefDate(new Date('2024-01-12'));
        // const paymentDate = faker.date.past();

        payment.push({
            paymentMethod,
            // paymentDate
        });
    }

    return payment;
};

const insertPayments = async () => {
    const payments = await generatePayments(1284);

    try {
        
        const docs = await Payment.insertMany(payments);
        console.log(`${docs.length} payments have been inserted into the database.`);
    } catch (err) {
        console.error(err);
        console.error(`${err.writeErrors?.length ?? 0} errors occurred during the insertMany operation.`);
    }
};


// insertPayments();









const generateOrder = async (num) => {
    const order = [];
    const stat = ['pending', 'on the way', 'delivered', 'returned', 'archived'];
    const existingOrderItems = await OrderItem.find({}, '_id');
    const orderItemsIdStrings = existingOrderItems.map(orderItem => orderItem._id.toString());

    const existingUsers = await User.find({}, '_id');
    const usersIdStrings = existingUsers.map(user => user._id.toString());

    const existingPayments= await Payment.find({}, '_id');
    const paymentsIdStrings = existingPayments.map(payment => payment._id.toString());

    for (let i = 500; i < num; i++) {
        const orderItems = faker.helpers.arrayElements(orderItemsIdStrings, { min: 1, max: 10 });
        const shippingAddress1 = faker.location.street();
        // const shippingAddress2 = faker.location.street();
        const city = faker.location.city();
        const zip = faker.location.zipCode()
        const country = faker.location.country();
        const phone = faker.phone.number();
        const status = faker.helpers.arrayElement(stat);
        const totalPrice = faker.number.int({ min: 1, max: 100000});
        const payment = paymentsIdStrings[i];
        const user = faker.helpers.arrayElement(usersIdStrings)

        order.push({
            orderItems,
            shippingAddress1,
            // shippingAddress2,
            city,
            zip,
            country,
            phone,
            status,
            totalPrice,
            payment,
            user
        });
    }

    return order;
};

const insertOrders = async () => {
    const orders = await generateOrder(2000);

    try {
        const docs = await Order.insertMany(orders);
        console.log(`${docs.length} orders have been inserted into the database.`);
    } catch (err) {
        console.error(err);
        console.error(`${err.writeErrors?.length ?? 0} errors occurred during the insertMany operation.`);
    }
};

insertOrders();
