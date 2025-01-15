import fs from 'fs'
import PropertiesReader from 'properties-reader'

import { handleFailure } from '../services/api-actions'
import { getStore } from '../store'
import { ParsedColumnTypes } from './types'

const validateStructuredPipeline = (parsedColumns: ParsedColumnTypes) => {
    if (!parsedColumns.target) {
        handleFailure({
            reason: `Invalid Column Input: Missing target ${parsedColumns}`
        })
        throw new Error(`Invalid Column Input: ${parsedColumns}`)
    }
}

const validateGpaiPipeline = (parsedColumns: ParsedColumnTypes) => {
    if (!parsedColumns?.target || !parsedColumns?.sensitiveAttributes) {
        handleFailure({
            reason: `Invalid Column Input: Missing target or sensitive columns: ${parsedColumns}}`
        })
        throw new Error(
            `Invalid Column Input: Missing target or sensitive columns`
        )
    }
}

const saveConfigs = async (
    parsedColumns: ParsedColumnTypes,
    fileName: string
) => {
    try {
        const configFilePath = 'config/master_config.properties'
        if (!fs.existsSync(configFilePath)) {
            handleFailure({
                reason: `Configuration file not found: ${configFilePath}`
            })
            throw new Error(`Configuration file not found: ${configFilePath}`)
        }

        const properties = PropertiesReader(configFilePath)

        if (!properties) {
            handleFailure({
                reason: `Failed to load configuration file`
            })
            throw new Error('Failed to load configuration file')
        }
        properties.set('target_column.target_column_name', parsedColumns.target)

        if (parsedColumns?.sensitiveAttributes) {
            //TODO Change this with proper config fromm the pipeline
        }
        properties.set('dataset_path.data_path', `datasets/${fileName}`)
        await properties.save(configFilePath)
        console.log('Config is set successfully')
        return true
    } catch (error) {
        console.error('Error while setting up Config:', error)
        throw error
    }
}

export const setConfigs = async ({
    pipeline,
    colInput,
    app
}: {
    pipeline: 'structured' | 'gpai'
    colInput: string
    app: 'gpai' | 'saas'
}) => {
    try {
        let parsedColumns: ParsedColumnTypes =
            typeof colInput === 'string' ? JSON.parse(colInput) : colInput

        // Validate based on pipeline type
        if (pipeline === 'gpai') {
            validateGpaiPipeline(parsedColumns)
        } else if (pipeline === 'structured') {
            validateStructuredPipeline(parsedColumns)
        } else {
            throw new Error('Invalid pipeline type')
        }

        // Save configurations
        const fileName = getStore('fileName')
        if (!fileName) {
            throw new Error('fileName is not defined in store')
        }
        await saveConfigs(parsedColumns, fileName)
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error)
        console.error('Error on Configuring:', errorMessage)
        await handleFailure({
            reason: `Error in Setting Up configs: ${errorMessage}`
        })
        throw error
    }
}
