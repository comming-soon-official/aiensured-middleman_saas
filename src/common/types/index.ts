export type DownloadModelTypes = {
    url: string
    pipeline: 'image' | 'structured' | 'gpai'
}

export type UploadS3Types = {
    app?: 'saas' | 'gpai'
    pipeline: 'image' | 'structured' | 'gpai'
}

export type ParsedColumnTypes = {
    target: string
    sensitiveAttributes?: string
    bias?: boolean
}
