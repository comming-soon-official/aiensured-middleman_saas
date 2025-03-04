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
        chdir(PIPELINE_PATH)

        // Download dataset and model
        await downloadImageDataset({ dataset })
        await downloadModel({ url: dataset, pipeline })

        await RunPipeline({ pipeline })
        return res.status(200).json({
            success: true,
            message: 'Image pipeline executed successfully'
        })
    } catch (error) {
        console.error('Error in image pipeline:', error)
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
    const destPath = './Dataset/data/'
    const ObjectDataset: Dataset = JSON.parse(dataset)
    try {
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true })
            console.log(`created parent directory ${destPath}`)
        }
        for (const [className, classData] of Object.entries(ObjectDataset)) {
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
        console.error('Error in downloadAndUnzipDataset:', error)
        await handleFailure({
            reason: `Error in downloadAndUnzipDataset: ${error}`
        })
        throw error // Re-throw to handle in parent
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
