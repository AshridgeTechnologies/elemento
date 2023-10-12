const OPFS_PROJECTS_DIR = 'GitHub'
export const internalProjectsDir = async () => {
    const opfsRoot = await navigator.storage.getDirectory()
    return opfsRoot.getDirectoryHandle(OPFS_PROJECTS_DIR, {create: true})
}
export const pathSegments = (path: string) => path.split('/')