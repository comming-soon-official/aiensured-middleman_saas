export function isValidUrl(urlString: string): boolean {
    try {
        new URL(urlString)
        return true
    } catch {
        return false
    }
}
