import fs from 'fs'
import path from 'path'

import { handleFailure } from '../services/api-actions'
import { settingStore } from '../store'
import { executeCommand } from './executables'
import { DownloadModelTypes } from './types'

export const downloadModel = async ({
    url,
    pipeline,
    app
}: DownloadModelTypes) => {
    console.log('⬇️ Starting model download:', { url, pipeline, app })
    const filename = path.basename(url)
    const fileExtension = path.extname(filename)
    const staticFilename = `model${fileExtension}`
    let targetFolder: string

    if (app === 'saas') {
        switch (pipeline) {
            case 'image':
                targetFolder = './Results/Model'
                break
            default:
                targetFolder = './results/model_paths'
        }
    } else {
        targetFolder = './results/model_paths'
    }

    try {
        console.log(`📁 Creating directory: ${targetFolder}`)
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true })
        }

        await executeCommand(
            `curl -s ${url} --output ${targetFolder}/${staticFilename}`
        )
        console.log('✅ Model downloaded successfully')
    } catch (error) {
        console.error('❌ Model download failed:', error)
        await handleFailure({
            reason: `Error in downloadAndMoveModel: ${error}`
        })
    }
}

export const downloadDataset = async ({ url }: { url: string }) => {
    console.log('⬇️ Starting dataset download:', url)
    const filename = path.basename(url)
    const fileExtension = path.extname(filename)
    const staticFilename = `dataset${fileExtension}`
    const targetFolder = './datasets'

    try {
        console.log('📁 Creating dataset directory')
        settingStore({ fileName: staticFilename })
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true })
        }
        await executeCommand(
            `curl -s ${url} --output ${targetFolder}/${staticFilename}`
        )
        console.log('✅ Dataset downloaded successfully')
    } catch (error) {
        console.error('❌ Dataset download failed:', error)
        await handleFailure({
            reason: `Error in Downloading : ${error}`
        })
    }
}
