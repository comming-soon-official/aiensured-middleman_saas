import { Request, Response } from 'express'
import { chdir } from 'process'

import { downloadDataset, downloadModel } from '../../common/downloadOps'
import { RunPipeline } from '../../common/executables'
import { setConfigs } from '../../common/setConfigs'
import { isValidUrl } from '../../common/utils/urlChecker'
import { PIPELINE_PATH } from '../../constant/paths'
import { handleFailure } from '../../services/api-actions'
import { GpaiBiasTypes } from './types'

export const runGpai = async (req: Request, res: Response) => {
    try {
        const { dataset, app, columnInput, model } = req.body as GpaiBiasTypes

        // Validate pipeline type
        if (app !== 'gpai') {
            return res.status(400).json({
                success: false,
                message: 'Invalid pipeline type. Expected "Gpai"'
            })
        }
        if (!isValidUrl(dataset) || !isValidUrl(model)) {
            handleFailure({
                reason: `Invalid dataset or model URL:- dataset:${dataset} or model:${model}`
            })
            return res.status(400).json({
                success: false,
                message: `Invalid dataset or model URL:- dataset:${dataset} or model:${model}`
            })
        }
        //Changing to Pipelines Directory
        chdir(PIPELINE_PATH)

        // Download dataset and model
        await downloadDataset({ url: dataset })
        await setConfigs({
            pipeline: 'gpai',
            colInput: JSON.stringify(columnInput),
            app: 'gpai'
        })

        await downloadModel({ url: model, pipeline: 'gpai' })

        await RunPipeline({ pipeline: 'gpai', app })
        return res.status(200).json({
            success: true,
            message: 'Gpai pipeline executed successfully'
        })
    } catch (error) {
        console.error('Error in image pipeline:', error)
        await handleFailure({
            reason: `Error in Gpai pipeline: ${error}`
        })
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}
