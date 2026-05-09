const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

console.log(process.env.MONGO_URI);
const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/users',   require('./routes/users'))
app.use('/api/ads',     require('./routes/ads'))
app.use('/api/reports', require('./routes/reports'))
app.use('/api/chats', require('./routes/chats'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/products', require('./routes/products'))
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('mongoDB connected')
        app.listen(process.env.PORT, () => {
            console.log(`server running on port ${process.env.PORT}`)
        })
    })
    .catch(err => console.error('error:', err))
