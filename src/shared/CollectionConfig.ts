export default class CollectionConfig {
    constructor(public name: string, public roles: string[]) {}
    isUserPrivate() { return this.roles.includes('user-private')}
    isSignedIn() { return this.roles.includes('signed-in')}
}

const parseLine = (line: string) => {
    const [name, roleList = ''] = line.trim().split(/ *: */)
    const roles = roleList.trim().split(/ *, */)
    return new CollectionConfig(name, roles)
}
export const parseCollections = (config: string) => {
    const lines = config.split(/\n+/)
    return lines.map(parseLine)
}
