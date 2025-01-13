export type PipelineParamsTypes = {
    projectId: string
    userId: string
    instanceId: string
    ipAddress: string
    pipeline: 'image' | 'structured'
}

export type ImagePipelineTypes = PipelineParamsTypes & {
    dataset: string
    model: string
    pipeline: 'image'
}
export type StructuredPipelineTypes = PipelineParamsTypes & {
    dataset: string
    model: string
    pipeline: 'structured'
    colInput: string
}

//Image Types
export type DownloadImageDatasetTypes = {
    dataset: string
}
