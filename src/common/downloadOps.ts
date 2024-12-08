import fs from 'fs'
import path from 'path'

import { executeCommand } from './executables'
import { DownloadModelTypes } from './types'

export const downloadModel = async ({ url, pipeline }: DownloadModelTypes) => {
    const filename = path.basename(url)
    const fileExtension = path.extname(filename)
    const staticFilename = `model${fileExtension}`
    let targetFolder: string
    switch (pipeline) {
        case 'image':
            targetFolder = './Results/Model'
            break
        default:
            targetFolder = './results/model_paths'
    }

    try {
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true })
        }

        await executeCommand(
            `curl -s ${url} --output ${targetFolder}/${staticFilename}`
        )
        console.log('model downloaded')
    } catch (error) {
        console.error('Error in downloadAndMoveModel:', error)
        // await handleFailure(id, instanceId)
    }
}
