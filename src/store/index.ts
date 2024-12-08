type GlobalStore = {
    userId?: string
    projectId?: string
    instanceId?: string
    credits?: number
    ipAddress?: string
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

export const settingStore = (store: GlobalStore) => {
    if (store.projectId) setStore('projectId', store.projectId)
    if (store.instanceId) setStore('instanceId', store.instanceId)
    if (store.userId) setStore('userId', store.userId)
    if (store.credits) setStore('credits', store.credits)
    if (store.ipAddress) setStore('ipAddress', store.ipAddress)
}
