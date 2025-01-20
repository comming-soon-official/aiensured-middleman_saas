import { Request, Response } from 'express'
import fs from 'fs'
import { writeFile } from 'fs/promises'
import { chdir } from 'process'

import { downloadModel } from '../../common/downloadOps'
import { RunPipeline } from '../../common/executables'
import { isValidUrl } from '../../common/utils/urlChecker'
import { PIPELINE_PATH } from '../../constant/paths'
import { handleFailure } from '../../services/api-actions'
import { ImagePipelineTypes } from './types'

export const runImage = async (req: Request, res: Response) => {
    console.log('📸 Starting image pipeline processing')
    try {
        const { dataset, pipeline, model } = req.body as ImagePipelineTypes

        // Validate pipeline type

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
        console.log('📂 Changing directory to:', PIPELINE_PATH)
        chdir(PIPELINE_PATH)

        // Download dataset and model
        console.log('⬇️ Starting dataset download')
        await downloadImageDataset({ dataset })
        console.log('⬇️ Starting model download')
        await downloadModel({ url: model, pipeline })

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
        // create folders 1st then doenload images dont nest the loops
        for (const [className, classData] of Object.entries(ObjectDataset) as [
            string,
            Dataset[string]
        ][]) {
            const classFolder = `./Dataset/data/${className}`

            if (!fs.existsSync(classFolder)) {
                fs.mkdirSync(classFolder)
                console.log(`created ${className} folder `)
            }
            //harish kuamr code
            const promises = classData.Uris.map(async (imageUrl) => {
                const imageName = imageUrl.split('/').pop()
                if (!imageName) {
                    throw new Error(
                        'Invalid image URL - cannot extract filename'
                    )
                }

                const imagePath = `${classFolder}/${imageName}`

                try {
                    const response = await fetch(imageUrl)
                    if (!response.ok) {
                        throw new Error(
                            `Failed to fetch image: ${response.statusText}`
                        )
                    }

                    const arrayBuffer = await response.arrayBuffer()
                    const buffer = Buffer.from(arrayBuffer)

                    await writeFile(imagePath, buffer)
                    console.log(
                        `Successfully downloaded and saved image to ${imagePath}`
                    )
                } catch (error) {
                    console.error('Error downloading/saving image:', error)
                }
            })

            await Promise.all(promises)

            // for (const imageUrl of classData.Uris) {
            //     try {
            //         const imageName = imageUrl.split('/').pop()
            //         const imagePath = `${classFolder}/${imageName}`

            //         execSync(`curl -o "${imagePath}" "${imageUrl}"`)
            //         console.log(
            //             `Downloaded and saved ${imageName} for ${className}`
            //         )
            //     } catch (error) {
            //         if (error instanceof Error) {
            //             console.error(
            //                 `Error downloading image from ${imageUrl}:`,
            //                 error instanceof Error ? error.message : error
            //             )
            //         } else {
            //             console.error('An unknown error occurred:', error)
            //         }
            //     }
            // }
        }
        createLabelFile(Object.keys(ObjectDataset))
    } catch (error) {
        console.error('❌ Dataset download failed:', error)
        console.error('Attempted to parse:', jsonData)
        await handleFailure({
            reason: `Error in downloadAndUnzipDataset: ${error}`
        })
        throw new Error(`Error on Download Dataset: ${error}`)
    }
}

export const createLabelFile = async (labels: string[]) => {
    try {
        const content = labels
            .map((label: string, index: number) => `${index + 1} ${label}`)
            .join('\n')

        const modelFolder = `./Results/Model/`
        //use async don't use sync much
        if (!fs.existsSync(modelFolder)) {
            fs.mkdirSync(modelFolder)
            console.log(`created ${modelFolder} folder `)
        }

        fs.writeFileSync('./Results/Model/labels.txt', content)

        console.log('File created and data written successfully!')
    } catch (error) {
        console.log(`Error in Creating Labels: ${error}`)
        await handleFailure({
            reason: `Error in Creating Labels: ${error}`
        })
        throw new Error(`Error in Creating Labels: ${error}`)
    }
}

//Types
type Dataset = {
    [className: string]: {
        Uris: string[]
    }
}
