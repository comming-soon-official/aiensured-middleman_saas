import { v4 as uuidV4 } from 'uuid'

import { PIPELINE_PATH } from '../constant/paths'
import { handleFailure, saveResultsInfo } from '../services/api-actions'
import { executeCommand } from './executables'
import {
    attachProcessHandlers,
    createChildProcess,
    createProcessPromise
} from './processHandler'
import { UploadS3Types } from './types'

export const uploadToS3 = async ({ pipeline }: UploadS3Types) => {
    try {
        const { sourceFolder, destPath, uuid } = getUploadPaths(pipeline)
        await zipResults({ sourceFolder })
        await uploadResults({ sourceFolder, destPath, uuid })
        return true
    } catch (error) {
        console.error('Error in uploadToS3:', error)
        await handleFailure({
            reason: `Error in uploadToS3: ${error}`
        })
        return false // Return false instead of throwing to handle error gracefully
    }
}

const getUploadPaths = (pipeline: 'image' | 'structured' | 'gpai') => {
    const sourceFolder = `${PIPELINE_PATH}/${(() => {
        switch (pipeline) {
            case 'image':
                return 'Results'
            default:
                return 'results'
        }
    })()}`
    const bucketName = 'saasproduct/Results'
    const uuid = uuidV4()
    const destPath = `s3://${bucketName}/${uuid}`

    return { sourceFolder, destPath, uuid }
}

const zipResults = async ({ sourceFolder }: { sourceFolder: string }) => {
    try {
        await executeCommand(`cd ${sourceFolder} && zip -r Results.zip *`)
    } catch (error) {
        console.error('Error zipping results:', error)
        await handleFailure({
            reason: `Error zipping results: ${error}`
        })
        throw error
    }
}

const uploadResults = async ({
    sourceFolder,
    destPath,
    uuid
}: {
    sourceFolder: string
    destPath: string
    uuid: string
}): Promise<void> => {
    const awsCliCommand = `aws s3 sync ${sourceFolder} ${destPath}`
    const child = createChildProcess(awsCliCommand)

    attachProcessHandlers(child, (data, type) => {
        if (type === 'stdout') {
            console.log('Upload progress:', data.toString().trim())
        } else {
            console.error('Upload error:', data.toString().trim())
        }
    })

    const successCallback = async () => {
        saveResultsInfo(uuid)
    }

    await createProcessPromise(child, successCallback)
}
