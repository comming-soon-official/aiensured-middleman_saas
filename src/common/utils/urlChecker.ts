import fs from 'fs'

export function isValidUrl(urlString: string): boolean {
    try {
        new URL(urlString)
        return true
    } catch {
        return false
    }
}

export const checkFileExists = async (filePath: string): Promise<boolean> => {
    try {
        await fs.promises.access(filePath, fs.constants.F_OK)
        return true
    } catch {
        return false
    }
}
