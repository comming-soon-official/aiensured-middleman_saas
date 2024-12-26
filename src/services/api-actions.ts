import { sendFailedStatus, sendSuccessStatus, terminateInstance } from './api'

export const saveResultsInfo = async (uuid: string) => {
    try {
        await sendSuccessStatus(uuid)
        await terminateInstance()
        console.log('SystemTerminated')
    } catch (error) {
        console.error('Error in saveResultsInfo:', error)
        await handleFailure({ reason: `Error in saveResultsInfo ${error}` })
        console.log('SystemTerminated')
    }
}

export const handleFailure = async ({ reason }: { reason: string }) => {
    await sendFailedStatus({ reason: reason })
    await terminateInstance()
}
