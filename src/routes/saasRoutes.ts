import express, { Request, Response } from 'express'

import { runImage } from '../controllers/saas/image'
import { runObject } from '../controllers/saas/object'
import { runStructured } from '../controllers/saas/structured'
import { settingStore } from '../store'

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the API' })
})

router.post('/run-pipeline', (req: Request, res: Response) => {
    const { pipeline, projectId, userId, instanceId, ipAddress } = req.body

    settingStore({
        projectId,
        userId,
        instanceId,
        ipAddress,
        credits: 2
    })
    try {
        switch (pipeline) {
            case 'image':
                return runImage(req, res)
            case 'structured':
                return runStructured(req, res)
            case 'object':
                return runObject(req, res)
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid pipeline type'
                })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

export default router
