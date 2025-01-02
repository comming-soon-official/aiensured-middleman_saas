import { Request, Response } from 'express'
import { chdir } from 'process'

import { downloadDataset, downloadModel } from '../../common/downloadOps'
import { RunPipeline } from '../../common/executables'
import { setConfigs } from '../../common/setConfigs'
import { PIPELINE_PATH } from '../../constant/paths'
import { handleFailure } from '../../services/api-actions'
import { GpaiBiasTypes } from './types'

export const runGpai = async (req: Request, res: Response) => {
    try {
        const { dataset, app, columnInput } = req.body as GpaiBiasTypes

        // Validate pipeline type
        if (app !== 'gpai') {
            return res.status(400).json({
                success: false,
                message: 'Invalid pipeline type. Expected "structured"'
            })
        }

        //Changing to Pipelines Directory
        chdir(PIPELINE_PATH)

        // Download dataset and model
        await downloadDataset({ url: dataset })
        await setConfigs({
            pipeline: 'structured',
            colInput: JSON.stringify(columnInput)
        })

        await downloadModel({ url: dataset, pipeline: 'structured', app })

        await RunPipeline({ pipeline: 'structured', app })
        return res.status(200).json({
            success: true,
            message: 'Structured pipeline executed successfully'
        })
    } catch (error) {
        console.error('Error in image pipeline:', error)
        await handleFailure({
            reason: `Error in Structured pipeline: ${error}`
        })
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}
