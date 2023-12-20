const OPFS_PROJECTS_DIR = 'Projects'
export const internalProjectsDir = async () => {
    const opfsRoot = await navigator.storage.getDirectory()
    return opfsRoot.getDirectoryHandle(OPFS_PROJECTS_DIR, {create: true})
}
