import { exec } from 'child_process'
import fs from 'fs'

import {
    PIPELINE_PATH,
    RunImagePipelineCommand,
    RunStructuredPipelineCommand
} from '../constant/paths'
import {
    attachProcessHandlers,
    createChildProcess,
    createProcessPromise
} from './processHandler'

export const executeCommand = async (command: string) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(error)
                reject(error)
            } else if (stderr) {
                console.log(error)
                reject(stderr)
            } else {
                console.log(stdout)
                resolve(stdout)
            }
        })
    })
}

export const RunPipeline = async ({
    pipeline
}: {
    pipeline: 'image' | 'structured'
}) => {
    const pipelineConfig = {
        image: {
            command: RunImagePipelineCommand,
            jsonPath: `${PIPELINE_PATH}/Results/json_metadata.json`
        },
        structured: {
            command: RunStructuredPipelineCommand,
            jsonPath: `${PIPELINE_PATH}/results/json_metadata.json`
        }
    }

    const config = pipelineConfig[pipeline] || pipelineConfig.structured

    try {
        const child = createChildProcess(config.command)
        attachProcessHandlers(child)

        const successCallback = async () => {
            await fs.promises.access(config.jsonPath, fs.constants.F_OK)
        }

        return createProcessPromise(child, successCallback)
    } catch (error) {
        console.error('Error in RunPipeline:', error)
        throw error
    }
}
