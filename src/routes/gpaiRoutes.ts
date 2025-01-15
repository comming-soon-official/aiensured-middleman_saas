import express, { Request, Response } from 'express'

import { runGpai } from '../controllers/gpai/gpaiController'
import { handleFailure } from '../services/api-actions'
import { settingStore } from '../store'

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the API' })
})

router.post('/run', (req: Request, res: Response) => {
    const { pipeline, projectId, userId, instanceId, ipAddress } = req.body
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

    if (!['gpai'].includes(pipeline)) {
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
        return runGpai(req, res)
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
