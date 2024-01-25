const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const {authJWT} = require('./helper/jwt');
const errorHandler = require('./helper/error-handler')
const path = require('path');
const cookieParser = require('cookie-parser');

require('dotenv').config();
const port = process.env.PORT;
const api = process.env.API_URL

//middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(morgan('tiny'));
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use((err, req, res, next) => {
    errorHandler(err, req, res, next);
});
app.use(cors());
app.options('*', cors());

app.use(express.static(path.join(__dirname, '/public')));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');



app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);


//mongo database connection
mongoose.connect(process.env.DB_URI, { dbName: 'shop' });
const db = mongoose.connection;
db.on('error',(error) => console.log(error));
db.once('open', () => console.log('Connected to the Database'));



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
