const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');


// =======================
// Load ENV
// =======================

dotenv.config();


// =======================
// Import Routes
// =======================

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payment');


// =======================
// Initialize App
// =======================

const app = express();



// =======================
// CORS Security
// =======================

app.use(cors({

    origin: process.env.FRONTEND_URL,

    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE"
    ],

    credentials: true

}));



// =======================
// Middleware
// =======================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);



// =======================
// Routes
// =======================

app.use(
    '/api/auth',
    authRoutes
);


app.use(
    '/api/products',
    productRoutes
);


app.use(
    '/api/orders',
    orderRoutes
);


app.use(
    '/api/users',
    userRoutes
);


app.use(
    '/api/payment',
    paymentRoutes
);




// =======================
// Health Check Route
// =======================

app.get('/api', (req, res) => {


    res.json({

        success: true,

        message:
            "NK Dairy Products API Running",

        version: "1.0.0",


        endpoints: {

            auth:
                "/api/auth",

            products:
                "/api/products",

            orders:
                "/api/orders",

            users:
                "/api/users",

            payment:
                "/api/payment"

        }


    });


});





// =======================
// MongoDB Connection
// =======================

mongoose
    .connect(
        process.env.MONGO_URI
    )

    .then(() => {

        console.log(
            "✅ Connected to MongoDB Atlas"
        );

    })

    .catch((error) => {

        console.error(
            "❌ MongoDB Error:",
            error
        );

    });




// =======================
// Error Handler
// =======================

app.use(
    (err, req, res, next) => {


        console.error(
            err.stack
        );


        res.status(500).json({

            success: false,

            message:
                "Server Error"

        });


    }
);




// =======================
// Start Server
// =======================

const PORT =
    process.env.PORT || 3000;



app.listen(PORT, () => {


    console.log(
        `🚀 Server running on port ${PORT}`
    );


    console.log(
        `📊 API: /api`
    );


});