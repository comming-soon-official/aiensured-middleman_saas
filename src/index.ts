import express from 'express'

import saasRouter from './routes/saasRoutes'

const app = express()
app.use(express.json())
const PORT = 3000

app.use('/saas', saasRouter)

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})
