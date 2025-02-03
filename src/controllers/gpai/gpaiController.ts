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
    console.log('Starting GPAI pipeline execution...')
    console.log('Request body:', JSON.stringify(req.body, null, 2))

    try {
        const { dataset, app, colInput, model } = req.body as GpaiBiasTypes
        console.log('Extracted parameters:', {
            dataset,
            app,
            colInput,
            model
        })

        // Validate pipeline type
        console.log('Validating pipeline type...')
        if (app !== 'gpai') {
            console.log('Pipeline validation failed: Invalid app type')
            return res.status(400).json({
                success: false,
                message: 'Invalid pipeline type. Expected "Gpai"'
            })
        }

        console.log('Validating URLs...')
        if (!isValidUrl(dataset) || !isValidUrl(model)) {
            const errorMsg = `Invalid dataset or model URL:- dataset:${dataset} or model:${model}`
            console.error('URL validation failed:', errorMsg)
            handleFailure({
                reason: `Invalid dataset or model URL:- dataset:${dataset} or model:${model}`
            })
            return res.status(400).json({
                success: false,
                message: `Invalid dataset or model URL:- dataset:${dataset} or model:${model}`
            })
        }

        console.log('Changing directory to:', PIPELINE_PATH)
        chdir(PIPELINE_PATH)
        console.log('Current working directory:', process.cwd())

        // Download dataset and model
        console.log('Initiating dataset download from:', dataset)
        await downloadDataset({ url: dataset })
        console.log('Dataset download completed')

        console.log('Initiating model download from:', model)
        await downloadModel({ url: model, pipeline: 'gpai' })
        console.log('Model download completed')

        console.log('Setting pipeline configurations...')
        await setConfigs({
            pipeline: 'gpai',
            colInput: JSON.stringify(colInput),
            app: 'gpai'
        })
        console.log('Pipeline configurations set successfully')

        console.log('Starting pipeline execution...')
        await RunPipeline({ pipeline: 'gpai', app })
        console.log('Pipeline execution completed successfully')

        return res.status(200).json({
            success: true,
            message: 'Gpai pipeline executed successfully'
        })
    } catch (error) {
        console.error('Error in GPAI pipeline:', error)
        console.error(
            'Stack trace:',
            error instanceof Error ? error.stack : 'No stack trace available'
        )
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            type: error instanceof Error ? error.constructor.name : typeof error
        })

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
