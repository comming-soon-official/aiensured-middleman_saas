import { exec } from 'child_process'
import { v4 as uuidv4 } from 'uuid'

import { PIPELINE_PATH } from '../constant/paths'
import { executeCommand } from './executables'
import { UploadS3Types } from './types'

export const uploadToS3 = async ({ pipeline, app }: UploadS3Types) => {
    const sourceFolder = `${PIPELINE_PATH}/${
        pipeline === 'image' ? 'Results' : 'results'
    }`
    const bucketName = 'saasproduct/Results'
    const uuid = uuidv4()

    const destPath = `s3://${bucketName}/${uuid}`

    //zip results within folder
    await executeCommand(`cd ${sourceFolder} && zip -r Results.zip *`)

    // Run the AWS CLI command to sync the local folder with S3
    const awsCliCommand = `aws s3 sync ${sourceFolder} ${destPath}`
    const child = exec(awsCliCommand)

    child.stdout?.on('data', (data) => {
        console.log(data)
    })

    child.stderr?.on('data', (data) => {
        console.error(data)
    })

    child.on('exit', async (code) => {
        if (code === 0) {
            console.log('Upload completed successfully')

            // await saveResultsInfo(projectId, instanceId, uuid)

            return
        } else {
            console.error('Upload failed')
            // await handleFailure(projectId, instanceId)
        }
    })
}
