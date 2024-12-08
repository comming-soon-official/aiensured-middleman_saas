type GlobalStore = {
    userId?: string
    projectId?: string
    instanceId?: string
    credits?: number
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

export const settingStore = (
    projectId: string,
    userId: string,
    instanceId: string,
    credits: number
) => {
    if (projectId) setStore('projectId', projectId)
    if (instanceId) setStore('instanceId', instanceId)
    if (userId) setStore('userId', userId)
    setStore('credits', credits)
}
