import { exec } from 'child_process'
import fs from 'fs'

import {
    PIPELINE_PATH,
    RunImagePipelineCommand,
    RunStructuredPipelineCommand
} from '../constant/paths'

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
        const child = exec(config.command)

        const handleOutput = (data: string, type: 'stdout' | 'stderr') => {
            const logMethod = type === 'stdout' ? console.log : console.error
            logMethod(`${type} on Running Pipeline:`, data)
        }

        child.stdout?.on('data', (data) =>
            handleOutput(data.toString(), 'stdout')
        )
        child.stderr?.on('data', (data) =>
            handleOutput(data.toString(), 'stderr')
        )

        return new Promise((resolve, reject) => {
            child.on('exit', async (code) => {
                console.log('Exit Code:', code)

                if (code !== 0) {
                    // await handlePipelineFailure(projectId, instanceId)
                    return reject(
                        new Error(`Pipeline exited with code ${code}`)
                    )
                }

                try {
                    await fs.promises.access(config.jsonPath, fs.constants.F_OK)
                    // await uploadToS3(projectId, instanceId, pipeline)
                    resolve(true)
                } catch (error) {
                    console.error('Upload failed:', error)
                    // await handlePipelineFailure(projectId, instanceId)
                    reject(error)
                }
            })
        })
    } catch (error) {
        console.error('Error in RunPipeline:', error)
        // await handlePipelineFailure(projectId, instanceId)
        throw error
    }
}
