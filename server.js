const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sawweq API Documentation',
            version: '1.0.0',
            description: 'Backend API for Sawweq Advertisement Platform',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
try {
    app.use('/api/ai',         require('./routes/aiRoute'));
    app.use('/api/users',      require('./routes/users'));
    app.use('/api/ads',        require('./routes/ads'));
    app.use('/api/reports',    require('./routes/reports'));
    app.use('/api/chats',      require('./routes/chats'));
    app.use('/api/admin',      require('./routes/admin'));
    app.use('/api/create-ads', require('./routes/create_ads'));
} catch (err) {
    console.error("❌ Error loading routes:", err.message);
}
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ mongoDB connected');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📄 Documentation: http://localhost:${PORT}/api-docs`);
        });
    })
    .catch(err => {
        console.error('❌ Connection error:', err.message);
    });