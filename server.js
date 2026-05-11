const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
console.log(process.env.MONGO_URI);
const app = express()
app.use(cors())//allows frontend and backend communication between different ports.
app.use(express.json())//Allows Express to read JSON data sent from frontend requests.

app.use('/api/users',   require('./routes/users'))
app.use('/api/ads',     require('./routes/ads'))
app.use('/api/reports', require('./routes/reports'))
app.use('/api/chats', require('./routes/chats'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/products', require('./routes/products'))
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
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
    },
    apis: ['./routes/*.js']
}

const specs = swaggerJsdoc(options)

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs)
)
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('mongoDB connected')
        app.listen(process.env.PORT, () => {
            console.log(`server running on port ${process.env.PORT}`)
        })
    })
    .catch(err => console.error('error:', err))
