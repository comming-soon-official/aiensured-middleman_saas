import { exec } from 'child_process'
import { v4 as uuidv4 } from 'uuid'

import { PIPELINE_PATH } from '../constant/paths'
import { executeCommand } from './executables'
import { UploadS3Types } from './types'

export const uploadToS3 = async ({ pipeline, app }: UploadS3Types) => {
    try {
        const { sourceFolder, destPath } = getUploadPaths(pipeline)

        await zipResults(sourceFolder)
        await uploadResults(sourceFolder, destPath)

        return true
    } catch (error) {
        console.error('Error in uploadToS3:', error)
        throw error
    }
}

const getUploadPaths = (pipeline: 'image' | 'structured') => {
    const sourceFolder = `${PIPELINE_PATH}/${
        pipeline === 'image' ? 'Results' : 'results'
    }`
    const bucketName = 'saasproduct/Results'
    const uuid = uuidv4()
    const destPath = `s3://${bucketName}/${uuid}`

    return { sourceFolder, destPath }
}

const zipResults = async (sourceFolder: string) => {
    try {
        await executeCommand(`cd ${sourceFolder} && zip -r Results.zip *`)
    } catch (error) {
        console.error('Error zipping results:', error)
        throw error
    }
}

const uploadResults = async (
    sourceFolder: string,
    destPath: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const awsCliCommand = `aws s3 sync ${sourceFolder} ${destPath}`
        const child = exec(awsCliCommand)

        child.stdout?.on('data', (data) => {
            console.log('Upload progress:', data)
        })

        child.stderr?.on('data', (data) => {
            console.error('Upload error:', data)
        })

        child.on('exit', (code) => {
            if (code === 0) {
                console.log('Upload completed successfully')
                resolve()
            } else {
                const error = new Error(`Upload failed with exit code ${code}`)
                console.error(error)
                reject(error)
            }
        })
    })
}
