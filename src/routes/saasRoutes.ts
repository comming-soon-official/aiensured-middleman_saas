import express, { Request, Response } from 'express'

import { runImage } from '../controllers/saas/image'
import { runObject } from '../controllers/saas/object'
import { runStructured } from '../controllers/saas/structured'
import { handleFailure } from '../services/api-actions'
import { settingStore } from '../store'

const router = express.Router()

// router.get('/', (req: Request, res: Response) => {
//     res.json({ message: 'Welcome to the API' })
// })

router.post('/', async (req: Request, res: Response) => {
    const { pipeline, projectId, userId, instanceId, ipAddress } = req.body
    let missingDatas = []
    console.log('route called')

    if (!pipeline) {
        missingDatas.push('Pipeline')
    }

    if (!instanceId) {
        missingDatas.push('instanceId')
    }

    if (!projectId) {
        missingDatas.push('projectId')
    }

    if (!userId) {
        missingDatas.push('userId')
    }

    if (!ipAddress) {
        missingDatas.push('ipAddress')
    }

    if (missingDatas.length > 0) {
        res.status(400).send(
            `Missing required parameters: ${missingDatas.join(', ')}`
        )
        return
    }

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
                console.log('inside image case')

                return await runImage(req, res)
            case 'structured':
                console.log('inside structured case')

                return await runStructured(req, res)
            case 'object':
                return await runObject(req, res)
            default:
                await handleFailure({ reason: 'Invalid pipeline type' })
                console.log('Invalid pipeline type')

                return res.status(400).json({
                    success: false,
                    message: 'Invalid pipeline type'
                })
        }
    } catch (error) {
        console.log(`Internal server error: ${error}`)

        await handleFailure({ reason: `Internal server error: ${error}` })

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

export default router
