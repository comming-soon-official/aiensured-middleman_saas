import express, { Request, Response } from 'express'

import { runGpai } from '../controllers/gpai/gpaiController'
import { handleFailure } from '../services/api-actions'
import { settingStore } from '../store'

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the API' })
})

router.post('/run', (req: Request, res: Response) => {
    console.log('📥 Received request body:', req.body)
    const { pipeline, projectId, userId, instanceId, ipAddress } = req.body
    let missing_data = []

    console.log('🔍 Validating request parameters...')
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
        console.log('❌ Validation failed - Missing parameters:', missing_data)
        if (projectId && userId) {
            console.log(
                '📝 Logging failure for projectId:',
                projectId,
                'userId:',
                userId
            )
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

    console.log('✅ All required parameters present')

    if (!['gpai'].includes(pipeline)) {
        console.log('❌ Invalid pipeline type:', pipeline)
        return res.status(400).json({
            success: false,
            message: 'Invalid pipeline type'
        })
    }

    console.log('💾 Storing settings with values:', {
        projectId,
        userId,
        instanceId,
        ipAddress,
        credits: 2
    })

    settingStore({
        projectId,
        userId,
        instanceId,
        ipAddress,
        credits: 2
    })

    try {
        console.log('🚀 Starting GPAI pipeline execution...')
        return runGpai(req, res)
    } catch (error) {
        console.error('❌ Pipeline execution failed:', error)
        console.error(
            'Stack trace:',
            error instanceof Error ? error.stack : 'No stack trace available'
        )
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

export default router
