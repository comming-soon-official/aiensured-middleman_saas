import express, { Request, Response } from 'express'

import { runImage } from '../controllers/saas/image'
import { runObject } from '../controllers/saas/object'
import { runStructured } from '../controllers/saas/structured'
import { handleFailure } from '../services/api-actions'
import { settingStore } from '../store'

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the Saas API' })
})

router.post('/run', (req: Request, res: Response) => {
    console.log('📥 Received request:', { body: req.body, path: req.path })

    const { pipeline, projectId, userId, instanceId, ipAddress } = req.body

    console.log('💾 Setting store with:', {
        projectId,
        userId,
        instanceId,
        ipAddress
    })

    let missing_data = []

    if (!instanceId) {
        missing_data.push('instanceId')
    }

    if (!projectId) {
        missing_data.push('projectId')
    }

    if (!userId) {
        missing_data.push('userId')
    }

    if (!ipAddress) {
        missing_data.push('ipAddress')
    }
    if (!pipeline) {
        missing_data.push('pipeline')
    }
    if (missing_data.length > 0) {
        if (projectId && userId) {
            handleFailure({
                reason: `Missing required parameters: ${missing_data.join(
                    ', '
                )}`
            })
        }
        return res
            .status(400)
            .send(`Missing required parameters: ${missing_data.join(', ')}`)
    }

    if (!['image', 'structured', 'object'].includes(pipeline)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid pipeline type'
        })
    }

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
