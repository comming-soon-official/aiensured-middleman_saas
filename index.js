function runPythonScript() {
    const { spawn } = require('child_process')
    const pythonCmd = '/home/ubuntu/miniconda3/envs/class/bin/python'
    const scriptFile = 'run.py'
    const startTime = Date.now()

    console.log(
        `[${new Date().toISOString()}] Starting Python script execution`
    )
    console.log(`Script path: ${pythonCmd} ${scriptFile}`)

    const pythonProcess = spawn(pythonCmd, ['-u', scriptFile])

    pythonProcess.on('error', (err) => {
        console.error('Failed to start process:', err)
    })

    pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString())
    })

    pythonProcess.stderr.on('data', (data) => {
        console.error(data.toString())
    })

    pythonProcess.on('close', (code) => {
        const executionTime = Date.now() - startTime

        console.log('\n=== Execution Details ===')
        console.log(`Duration: ${executionTime}ms`)
        console.log(`Script: ${pythonCmd} ${scriptFile}`)
        console.log(`Process exited with code: ${code}`)

        if (code !== 0) {
            console.log('\n=== Error Details ===')
            console.log(`Exit code: ${code}`)
            return
        }

        console.log('\n=== Execution Complete ===')
        console.log('Status: Success')
    })
}

runPythonScript()

const secesscallback = () => {
    //call and success APi
    //other logics
    //call termination api
}

const errorCallback = () => {
    //call and failure APi
    //call termination api
}
