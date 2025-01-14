import PropertiesReader from 'properties-reader'

import { handleFailure } from '../services/api-actions'
import { getStore } from '../store'

const validateStructuredPipeline = (colInput: string) => {
    if (!colInput) {
        throw new Error(`Invalid Column Input: ${colInput}`)
    }
}

const validateGpaiPipeline = (parsedColumns: any) => {
    if (!parsedColumns?.target || !parsedColumns?.sensitive) {
        throw new Error(
            `Invalid Column Input: Missing target or sensitive columns`
        )
    }
}

const saveConfigs = async (colInput: string, fileName: string) => {
    const configFilePath = 'config/master_config.properties'
    const properties = PropertiesReader(configFilePath)

    if (!properties) {
        throw new Error('Failed to load configuration file')
    }

    properties.set('target_column.target_column_name', colInput)
    properties.set('dataset_path.data_path', `datasets/${fileName}`)
    await properties.save(configFilePath)
    console.log('config is settled')
}

export const setConfigs = async ({
    pipeline,
    colInput,
    app
}: {
    pipeline: string
    colInput: string
    app: 'gpai' | 'saas'
}) => {
    try {
        const parsedColumns =
            typeof colInput === 'string' ? JSON.parse(colInput) : colInput

        // Validate based on pipeline type
        if (pipeline == 'structured') {
            if ((app = 'gpai')) {
                validateGpaiPipeline(colInput)
            } else {
                validateStructuredPipeline(colInput)
            }
        }
        // Save configurations
        const fileName = getStore('fileName')
        if (!fileName) {
            throw new Error('fileName is not defined in store')
        }
        await saveConfigs(colInput, fileName)
    } catch (error) {
        console.error('Error on Configuring', error)
        await handleFailure({
            reason: `Error in Setting Up configs: ${error}`
        })
    }
}
