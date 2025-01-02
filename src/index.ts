import express from 'express'

import gpaiRoutes from './routes/gpaiRoutes'
import saasRouter from './routes/saasRoutes'

const app = express()
app.use(express.json())
const PORT = 3000

app.use('/saas', saasRouter)

app.use('/gpai', gpaiRoutes)

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})
