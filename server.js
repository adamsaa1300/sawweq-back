const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const protect = require('./middleware/auth')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth',   require('./routes/auth'))

app.use('/api/users',  protect, require('./routes/users'))
app.use('/api/ads',    protect, require('./routes/ads'))
app.use('/api/reports',  protect, require('./routes/reports'))
app.use('/api/chats', protect,  require('./routes/chats'))
app.use('/api/admin', protect,  require('./routes/admin'))
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('mongoDB connected')
        app.listen(process.env.PORT, () => {
            console.log(`server running on port ${process.env.PORT}`)
        })
    })
    .catch(err => console.error('error:', err))