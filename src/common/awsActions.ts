import { v4 as uuidv4 } from 'uuid'

import { PIPELINE_PATH } from '../constant/paths'
import { executeCommand } from './executables'
import {
    attachProcessHandlers,
    createChildProcess,
    createProcessPromise
} from './processHandler'
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
    const awsCliCommand = `aws s3 sync ${sourceFolder} ${destPath}`
    const child = createChildProcess(awsCliCommand)

    attachProcessHandlers(child, (data, type) => {
        if (type === 'stdout') {
            console.log('Upload progress:', data)
        } else {
            console.error('Upload error:', data)
        }
    })

    await createProcessPromise(child)
}
