export type DownloadModelTypes = {
    url: string
    pipeline: 'image' | 'structured'
}

export type UploadS3Types = {
    app: 'saas' | 'gpai'
    pipeline: 'image' | 'structured'
}
