import { Request, Response } from 'express'
import { chdir } from 'process'

import { downloadDataset, downloadModel } from '../../common/downloadOps'
import { RunPipeline } from '../../common/executables'
import { setConfigs } from '../../common/setConfigs'
import { PIPELINE_PATH } from '../../constant/paths'
import { handleFailure } from '../../services/api-actions'
import { StructuredPipelineTypes } from './types'

export const runStructured = async (req: Request, res: Response) => {
    console.log('🚀 Starting structured pipeline execution')
    try {
        const { dataset, pipeline, colInput, model } =
            req.body as StructuredPipelineTypes
        console.log('📥 Received request data:', {
            dataset,
            pipeline,
            colInput
        })

        // Validate pipeline type
        if (pipeline !== 'structured') {
            console.warn('❌ Invalid pipeline type received:', pipeline)
            return res.status(400).json({
                success: false,
                message: 'Invalid pipeline type. Expected "structured"'
            })
        }

        //Changing to Pipelines Directory
        console.log('📂 Changing directory to:', PIPELINE_PATH)
        chdir(PIPELINE_PATH)
        console.log('✅ Directory changed successfully')

        // Download dataset and model
        console.log('⏳ Starting dataset download...')
        await downloadDataset({ url: dataset })
        console.log('✅ Dataset download completed')

        console.log('⚙️ Setting pipeline configurations...')
        await setConfigs({ pipeline, colInput, app: 'gpai' })
        console.log('✅ Configurations set successfully')

        console.log('⏳ Starting model download...')
        await downloadModel({ url: model, pipeline, app: 'saas' })
        console.log('✅ Model download completed')

        console.log('🔄 Executing pipeline...')
        await RunPipeline({ pipeline })
        console.log('✅ Pipeline execution completed')

        console.log('📤 Sending success response')
        return res.status(200).json({
            success: true,
            message: 'Structured pipeline executed successfully'
        })
    } catch (error) {
        console.error('❌ Error in structured pipeline:', error)
        console.error(
            'Stack trace:',
            error instanceof Error ? error.stack : 'No stack trace'
        )
        await handleFailure({
            reason: `Error in Structured pipeline: ${error}`
        })
        console.log('📤 Sending error response')
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}
