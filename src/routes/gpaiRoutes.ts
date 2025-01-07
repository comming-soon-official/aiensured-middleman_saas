import express, { Request, Response } from 'express'

import { runGpai } from '../controllers/gpai/gpaiController'
import { settingStore } from '../store'

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the API' })
})

router.post('/run', (req: Request, res: Response) => {
    const { pipeline, projectId, userId, instanceId, ipAddress } = req.body

    settingStore({
        projectId,
        userId,
        instanceId,
        ipAddress,
        credits: 2
    })
    runGpai(req, res)
})

export default router
