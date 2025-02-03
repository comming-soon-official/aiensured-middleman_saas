type GlobalStore = {
    userId?: string
    projectId?: string
    instanceId?: string
    credits?: number
    ipAddress?: string
    datasetName?: string
    modelName?: string
}

const store: GlobalStore = {}

// Function to set values in the store using generics
export const setStore = <T extends keyof GlobalStore>(
    key: T,
    value: GlobalStore[T]
) => {
    store[key] = value
}

// Function to get values from the store using generics
export const getStore = <T extends keyof GlobalStore>(
    key: T
): GlobalStore[T] => {
    return store[key]
}

export const settingStore = (storeData: GlobalStore) => {
    if (!storeData) {
        throw new Error('Store data cannot be null or undefined')
    }

    if (storeData.projectId) setStore('projectId', storeData.projectId)
    if (storeData.instanceId) setStore('instanceId', storeData.instanceId)
    if (storeData.userId) setStore('userId', storeData.userId)
    if (storeData.credits) setStore('credits', storeData.credits)
    if (storeData.ipAddress) setStore('ipAddress', storeData.ipAddress)
    if (storeData.datasetName) setStore('datasetName', storeData.datasetName)
    if (storeData.modelName) setStore('modelName', storeData.modelName)
}
