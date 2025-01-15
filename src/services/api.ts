import axios from 'axios'

import { API_URL_HEAD, AwsS3ResultsPath } from '../constant/paths'
import { getStore } from '../store'
import { handleFailure } from './api-actions'

export const terminateInstance = () => {
    const data = { instanceId: getStore('instanceId') }
    const makeAPICall = async () => {
        try {
            const response = await axios.post(
                `${API_URL_HEAD}/terminate`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            console.log('Terminate API Response:', response.data)
        } catch (error) {
            console.error('Error terminating instance:', error)
        }
    }
    setTimeout(makeAPICall, 60_000) //wait for 60seconds
    console.warn('System is about to terminate')
}
export const sendFailedStatus = async ({ reason }: { reason: string }) => {
    const data = {
        status: 'error',
        reason: reason,
        projectId: getStore('projectId')
    }

    try {
        const response = await axios.post(
            `${API_URL_HEAD}/parse/functions/save-status`,
            data,
            {
                headers: {
                    'X-Parse-Application-Id': 'myAppId',
                    'X-Parse-REST-API-Key': 'REST_API_KEY',
                    'Content-Type': 'application/json'
                }
            }
        )
        console.log('Run API Response:', response.data)
    } catch (error) {
        console.error('Error sending Failure status:', error)
        await handleFailure({
            reason: `Error sending Failure status: ${error}`
        })
    }
}

export const sendSuccessStatus = async (uuid: string) => {
    const data = {
        status: 'success',
        projectId: getStore('projectId'),
        results: `${AwsS3ResultsPath}/${uuid}/`
    }

    try {
        const response = await axios.post(
            `${API_URL_HEAD}/parse/functions/save-status`,
            data,
            {
                headers: {
                    'X-Parse-Application-Id': 'myAppId',
                    'X-Parse-REST-API-Key': 'REST_API_KEY',
                    'Content-Type': 'application/json'
                }
            }
        )
        console.log('Run API Response:', response.data)
    } catch (error) {
        console.error('Error sending success status:', error)
        await handleFailure({
            reason: `Error sending success status: ${error}`
        })
    }
}

// export const liveLogsTrigger = async () => {
//     const data = {
//         projectId: getStore('projectId'),
//         ipAddress: getStore('ipAddress')
//     }

//     try {
//         const response = await axios.post(
//             `${API_URL_HEAD}/parse/functions/get_logs`,
//             data,
//             {
//                 headers: {
//                     'X-Parse-Application-Id': 'myAppId',
//                     'X-Parse-REST-API-Key': 'REST_API_KEY',
//                     'Content-Type': 'application/json'
//                 }
//             }
//         )
//         console.log('Run API Response from LiveLogsTrigger:', response.data)
//     } catch (error) {
//         console.error('Error sending success status:', error)
//         // Handle the error appropriately
//     }
// }

export const reduceCredits = async () => {
    const data = {
        userId: getStore('userId'),
        instanceId: getStore('instanceId'),
        credits: getStore('credits')
    }
    try {
        const response = await axios.post(
            `${API_URL_HEAD}/parse/functions/reduce_credits`,
            data,
            {
                headers: {
                    'X-Parse-Application-Id': 'myAppId',
                    'X-Parse-REST-API-Key': 'REST_API_KEY',
                    'Content-Type': 'application/json'
                }
            }
        )
        console.log('Reduce API Response:', response.data)
    } catch (error) {
        console.log('Error in reduceCredits')
        await handleFailure({
            reason: `Error in reduceCredits: ${error}`
        })
    }
}
