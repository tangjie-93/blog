export {}

declare global {
    interface Window {
        __GIT_INFO__?: {
            id: string
            shortId: string
            branch: string
            commitTime: string
            buildTime: string
            version: string
        }
    }
}
