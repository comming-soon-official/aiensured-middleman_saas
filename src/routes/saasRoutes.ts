import express, { Request, Response } from 'express'

import { runImage } from '../controllers/saas/image'
import { runObject } from '../controllers/saas/object'
import { runStructured } from '../controllers/saas/structured'
import { settingStore } from '../store'

const router = express.Router()

// router.get('/', (req: Request, res: Response) => {
//     res.json({ message: 'Welcome to the API' })
// })

router.post('/', (req: Request, res: Response) => {
    console.log('📥 Received request:', { body: req.body, path: req.path })
    const { pipeline, projectId, userId, instanceId, ipAddress } = req.body

    console.log('💾 Setting store with:', {
        projectId,
        userId,
        instanceId,
        ipAddress
    })
    settingStore({
        projectId,
        userId,
        instanceId,
        ipAddress,
        credits: 2
    })
    try {
        console.log(`🚀 Starting ${pipeline} pipeline`)
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
        console.error('❌ Pipeline execution failed:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

export default router
