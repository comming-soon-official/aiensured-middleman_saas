import express, { Request, Response } from 'express'

import gpaiRoutes from './routes/gpaiRoutes'
import saasRouter from './routes/saasRoutes'

const app = express()
app.use(express.json())
const PORT = 3000

app.use('/saas', saasRouter)

app.use('/gpai', gpaiRoutes)

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Middleman v2 for Saas Product')
})

app.get('/healthcheck', (req, res) => {
    res.send('passed')
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})
