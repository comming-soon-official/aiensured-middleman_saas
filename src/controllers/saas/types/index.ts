export type PipelineTypes = {
    projectId: string
    userId: string
    instanceId: string
    ipAddress: string
    pipeline: 'image' | 'object' | 'structured'
}

export type ImagePipelineTypes = PipelineTypes & {
    dataset: string
    model: string
}
export type StructuredPipelineTypes = PipelineTypes & {
    dataset: string
    model: string
    columnInput: string
}

//Image Types
export type DownloadImageDatasetTypes = {
    dataset: string
}
