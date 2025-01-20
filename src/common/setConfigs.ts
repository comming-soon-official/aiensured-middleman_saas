import fs from 'fs'
import PropertiesReader from 'properties-reader'

import { handleFailure } from '../services/api-actions'
import { getStore } from '../store'
import { ParsedColumnTypes } from './types'

const validateStructuredPipeline = (parsedColumns: ParsedColumnTypes) => {
    console.log('Validating structured pipeline with columns:', parsedColumns)
    if (!parsedColumns.target) {
        console.error(
            'Structured pipeline validation failed: Missing target column'
        )
        handleFailure({
            reason: `Invalid Column Input: Missing target ${parsedColumns}`
        })
        throw new Error(`Invalid Column Input: ${parsedColumns}`)
    }
    console.log('Structured pipeline validation successful')
}

const validateGpaiPipeline = (parsedColumns: ParsedColumnTypes) => {
    console.log('Validating GPAI pipeline with columns:', parsedColumns)
    if (!parsedColumns?.target || !parsedColumns?.sensitiveAttributes) {
        console.error(
            'GPAI pipeline validation failed: Missing required columns',
            parsedColumns
        )
        handleFailure({
            reason: `Invalid Column Input: Missing target or sensitive columns: ${JSON.stringify(
                parsedColumns
            )}`
        })
        throw new Error(
            `Invalid Column Input: Missing target or sensitive columns: ${JSON.stringify(
                parsedColumns
            )}`
        )
    }
    console.log('GPAI pipeline validation successful')
}

const saveConfigs = async (
    parsedColumns: ParsedColumnTypes,
    fileName: string
) => {
    console.log('Starting config save operation:', {
        parsedColumns,
        fileName
    })
    try {
        const configFilePath = 'config/master_config.properties'
        console.log('Checking configuration file existence:', configFilePath)

        if (!fs.existsSync(configFilePath)) {
            console.error(
                'Configuration file not found at path:',
                configFilePath
            )
            handleFailure({
                reason: `Configuration file not found: ${configFilePath}`
            })
            throw new Error(`Configuration file not found: ${configFilePath}`)
        }

        console.log('Loading properties from config file')
        const properties = PropertiesReader(configFilePath)

        if (!properties) {
            console.error('Failed to initialize PropertiesReader')
            handleFailure({
                reason: `Failed to load configuration file`
            })
            throw new Error('Failed to load configuration file')
        }

        console.log('Setting target column:', parsedColumns.target)
        properties.set('target_column.target_column_name', parsedColumns.target)

        if (parsedColumns?.sensitiveAttributes) {
            //TODO Change this with proper config fromm the pipeline
        }

        console.log('Setting dataset path:', `datasets/${fileName}`)
        properties.set('dataset_path.data_path', `datasets/${fileName}`)

        console.log('Saving configuration to file')
        await properties.save(configFilePath)
        console.log('Configuration saved successfully')
        return true
    } catch (error) {
        console.error('Error in saveConfigs:', error)
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
    console.log('Starting setConfigs with:', { pipeline, app })
    console.log('Column input received:', colInput)

    try {
        // Handle potential double-stringified JSON
        let parsedColumns: ParsedColumnTypes
        try {
            const firstParse = JSON.parse(colInput)
            parsedColumns =
                typeof firstParse === 'string'
                    ? JSON.parse(firstParse)
                    : firstParse
        } catch (parseError) {
            console.error('JSON parsing error:', parseError)
            throw new Error(`Invalid column input format: ${colInput}`)
        }

        console.log('Parsed columns:', parsedColumns)

        console.log('Validating pipeline type:', pipeline)
        if (pipeline === 'gpai') {
            validateGpaiPipeline(parsedColumns)
        } else if (pipeline === 'structured') {
            validateStructuredPipeline(parsedColumns)
        } else {
            console.error(
                '[setConfigs]:Invalid pipeline type received:',
                pipeline
            )
            throw new Error('Invalid pipeline type')
        }

        const fileName = getStore('fileName')
        console.log('Retrieved filename from store:', fileName)

        if (!fileName) {
            console.error('Filename not found in store')
            throw new Error('fileName is not defined in store')
        }

        console.log('Proceeding to save configurations')
        await saveConfigs(parsedColumns, fileName)
        console.log('setConfigs completed successfully')
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error)
        console.error('setConfigs failed:', {
            error: errorMessage,
            pipeline,
            app,
            colInput
        })
        await handleFailure({
            reason: `Error in Setting Up configs: ${errorMessage}`
        })
        throw error
    }
}
