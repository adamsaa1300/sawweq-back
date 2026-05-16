const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const protect = require('./middleware/auth')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// swagger config
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sawweq API',
            version: '1.0.0',
            description: 'API documentation for Sawweq project'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
    },
    apis: ['./routes/*.js']
}
const specs = swaggerJsdoc(options)

// public routes

app.use('/api/products', require('./routes/products'))
app.use('/api/ai',       require('./routes/aiRoute'))
app.use('/uploads',      express.static(path.join(__dirname, 'uploads')))
app.use('/api-docs',     swaggerUi.serve, swaggerUi.setup(specs))

// protected routes
app.use('/api/users', require('./routes/users'))
app.use('/api/ads',      protect, require('./routes/create_ads'))
app.use('/api/reports',  protect, require('./routes/reports'))
app.use('/api/chats',    protect, require('./routes/chats'))
app.use('/api/admin',    protect, require('./routes/admin'))

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('mongoDB connected')
        app.listen(process.env.PORT, () => {
            console.log(`server running on port ${process.env.PORT}`)
        })
    })
    .catch(err => console.error('error:', err))