import { ChildProcess, exec } from 'child_process'

type OutputType = 'stdout' | 'stderr'
type ProcessHandler = (data: string, type: OutputType) => void

export const createChildProcess = (command: string) => {
    return exec(command)
}

export const attachProcessHandlers = (
    process: ChildProcess,
    onOutput?: ProcessHandler
) => {
    const defaultHandler = (data: string, type: OutputType) => {
        const logMethod = type === 'stdout' ? console.log : console.error
        logMethod(`${type}:`, data)
    }

    const handler = onOutput || defaultHandler

    process.stdout?.on('data', (data) => handler(data.toString(), 'stdout'))
    process.stderr?.on('data', (data) => handler(data.toString(), 'stderr'))
}

export const createProcessPromise = (
    process: ChildProcess,
    successCallback?: () => Promise<any>,
    errorCallback?: () => Promise<any>
) => {
    return new Promise((resolve, reject) => {
        process.on('exit', async (code) => {
            console.log('Exit Code:', code)

            if (code !== 0) {
                if (errorCallback) await errorCallback()
                return reject(new Error(`Process exited with code ${code}`))
            }

            try {
                if (successCallback) await successCallback()
                resolve(true)
            } catch (error) {
                console.error('Process callback failed:', error)
                if (errorCallback) await errorCallback()
                reject(error)
            }
        })
    })
}
