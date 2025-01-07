import PropertiesReader from 'properties-reader'

import { handleFailure } from '../services/api-actions'
import { getStore } from '../store'

export const setConfigs = async ({
    pipeline,
    colInput
}: {
    pipeline: string
    colInput: string
}) => {
    try {
        // const parsedColumns =
        //     typeof colInput === 'string' ? JSON.parse(colInput) : colInput

        // switch (pipeline) {
        //     case 'structured':
        //         if (!colInput) {
        //             await handleFailure({
        //                 reason: `Invalid Column Input: ${colInput}`
        //             })
        //         }
        //         break
        //     case 'gpai':
        //         if (!parsedColumns?.target || !parsedColumns?.sensitive) {
        //             await handleFailure({
        //                 reason: `Invalid Column Input: ${colInput}`
        //             })
        //         }
        //         break
        //     default:
        //         await handleFailure({
        //             reason: `Invalid Pipeline Type: ${pipeline}`
        //         })
        // }
        try {
            const configFilePath = 'config/master_config.properties'
            const properties = PropertiesReader(configFilePath)
            if (!properties) {
                throw new Error('Failed to load configuration file')
            }
            properties.set('target_column.target_column_name', colInput)
            properties.set(
                'dataset_path.data_path',
                `datasets/${getStore('fileName')}`
            )
            await properties.save(configFilePath)
            console.log('config is settled')
        } catch (error) {
            console.error('Error on Configuring', error)
            await handleFailure({
                reason: `Error in Setting Up configs: ${error}`
            })
        }
    } catch (error) {
        console.error('Error on Configuring', error)
        await handleFailure({
            reason: `Error in Setting Up configs: ${error}`
        })
    }
}
