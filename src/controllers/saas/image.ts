//Download Dataset Operations
import { execSync } from 'child_process'
import { Request, Response } from 'express'
import fs from 'fs'
import { chdir } from 'process'

import { downloadModel } from '../../common/downloadOps'
import { RunPipeline } from '../../common/executables'
import { PIPELINE_PATH } from '../../constant/paths'
import { handleFailure } from '../../services/api-actions'
import { ImagePipelineTypes } from './types'

export const runImage = async (req: Request, res: Response) => {
    console.log('📸 Starting image pipeline processing')
    try {
        const { dataset, pipeline } = req.body as ImagePipelineTypes

        // Validate pipeline type
        if (pipeline !== 'image') {
            return res.status(400).json({
                success: false,
                message: 'Invalid pipeline type. Expected "image"'
            })
        }

        //Changing to Pipelines Directory
        console.log('📂 Changing directory to:', PIPELINE_PATH)
        chdir(PIPELINE_PATH)

        // Download dataset and model
        console.log('⬇️ Starting dataset download')
        await downloadImageDataset({ dataset })
        console.log('⬇️ Starting model download')
        await downloadModel({ url: dataset, pipeline })

        console.log('▶️ Executing pipeline')
        await RunPipeline({ pipeline })
        return res.status(200).json({
            success: true,
            message: 'Image pipeline executed successfully'
        })
    } catch (error) {
        console.error('❌ Image pipeline failed:', error)
        await handleFailure({
            reason: `Error in image pipeline: ${error}`
        })
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export const downloadImageDataset = async ({
    dataset
}: {
    dataset: string
}) => {
    console.log('📥 Starting image dataset download')
    const destPath = './Dataset/data/'
    const jsonData =
        typeof dataset === 'string' ? dataset : JSON.stringify(dataset)
    console.log('Data before parsing:', jsonData)

    try {
        const ObjectDataset = JSON.parse(jsonData)
        console.log(
            '📊 Processing dataset structure:',
            Object.keys(ObjectDataset)
        )
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true })
            console.log(`created parent directory ${destPath}`)
        }
        for (const [className, classData] of Object.entries(ObjectDataset) as [
            string,
            Dataset[string]
        ][]) {
            const classFolder = `./Dataset/data/${className}`

            if (!fs.existsSync(classFolder)) {
                fs.mkdirSync(classFolder)
                console.log(`created ${className} folder `)
            }

            for (const imageUrl of classData.Uris) {
                try {
                    const imageName = imageUrl.split('/').pop()
                    const imagePath = `${classFolder}/${imageName}`

                    execSync(`curl -o "${imagePath}" "${imageUrl}"`)
                    console.log(
                        `Downloaded and saved ${imageName} for ${className}`
                    )
                } catch (error) {
                    if (error instanceof Error) {
                        console.error(
                            `Error downloading image from ${imageUrl}:`,
                            error instanceof Error ? error.message : error
                        )
                    } else {
                        console.error('An unknown error occurred:', error)
                    }
                }
            }
        }
        createLabelFile(Object.keys(ObjectDataset))
    } catch (error) {
        console.error('❌ Dataset download failed:', error)
        console.error('Attempted to parse:', jsonData)
        await handleFailure({
            reason: `Error in downloadAndUnzipDataset: ${error}`
        })
        throw new Error(`Invalid JSON format: ${error}`)
    }
}

export const createLabelFile = (labels: string[]) => {
    try {
        const content = labels
            .map((label: string, index: number) => `${index + 1} ${label}`)
            .join('\n')

        fs.writeFileSync('./Results/Model/labels.txt', content)

        console.log('File created and data written successfully!')
    } catch (error) {
        console.error('An error occurred:', error)
    }
}

//Types
type Dataset = {
    [className: string]: {
        Uris: string[]
    }
}
