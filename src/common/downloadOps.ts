import fs from 'fs'
import path from 'path'

import { handleFailure } from '../services/api-actions'
import { settingStore } from '../store'
import { executeCommand } from './executables'
import { DownloadModelTypes } from './types'

export const downloadModel = async ({ url, pipeline }: DownloadModelTypes) => {
    // use same method as image dataset
    console.log('⬇️ Starting model download:', { url, pipeline })
    const filename = path.basename(url)
    const fileExtension = path.extname(filename)
    const staticFilename = `model${fileExtension}`

    const targetObj: Record<string, string> = {
        image: './Results/Model'
    }
    let targetFolder = targetObj[pipeline as string] || './results/model_paths'

    // switch (pipeline) {
    //     case 'image':
    //         targetFolder = './Results/Model'
    //         break
    //     default:
    //         targetFolder = './results/model_paths'
    // }

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
