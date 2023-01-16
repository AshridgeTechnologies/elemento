import git, {CallbackFsClient, HttpClient, PromiseFsClient} from 'isomorphic-git'
import {gitHubUsername} from '../shared/authentication'
import assert from 'assert'
import {Octokit} from 'octokit'

type Fs = CallbackFsClient | PromiseFsClient

const corsProxy = 'https://cors.isomorphic-git.org'

const defaultMessage = () => `Changes ${new Date()}`
const defaultAuthor = () => gitHubUsername() ?? 'unknown'

const exists = async (fileSystem: Fs, filepath: string) => {
    try {
        const fs = fileSystem as any
        assert(fs.promises)
        await fs.promises.stat(filepath)
        return true
    } catch (err: any) {
        if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
            return false
        } else {
            console.error('Unhandled error in "exists()" function', err)
            throw err
        }
    }
}
export const isGitWorkingCopy = async (fileSystem: Fs, localDirPath: string) => {
    const configFilePath = `/${localDirPath}/.git/config`
    const configFileExists = await exists(fileSystem, configFilePath)
    return configFileExists
}

export default class GitProjectStore {
    constructor(private fs: Fs, private http: HttpClient,
                private username: string | null = null, private accessToken: string | null = null, private workingDirRoot: string = '') {
    }

    async init(localName: string) {
        const {fs} = this
        const dir = `${this.workingDirRoot}/${localName}`
        await git.init({ fs, dir, defaultBranch: 'main' })
    }

    async createGitHubRepo(localName: string, repoName: string) {
        const octokit = new Octokit({ auth: this.accessToken })
        const response = await octokit.rest.repos.createForAuthenticatedUser({
            name: repoName,
        })
        const {html_url: repoUrl, name: actualRepoName} = response.data
        // console.log('Created repo', repoUrl)
        await this.setOriginRemote(localName, repoUrl)
        return actualRepoName
    }

    async getOriginRemote(localName: string) {
        const {fs} = this
        const dir = `${this.workingDirRoot}/${localName}`
        if (await isGitWorkingCopy(fs, dir)) {
            return (await git.getConfig({fs, dir, path: 'remote.origin.url'})) ?? null
        }

        return null
    }

    async setOriginRemote(localName: string, url: string) {
        const {fs} = this
        const dir = `${this.workingDirRoot}/${localName}`
        await git.setConfig({fs, dir, path: 'remote.origin.url', value: url})
        await git.setConfig({fs, dir, path: 'remote.origin.fetch', value: '+refs/heads/*:refs/remotes/origin/*'})
    }

    async isConnectedToGitHubRepo(localName: string) {
        return !! await this.getOriginRemote(localName)
    }

    async commitAndPush(localName: string, message: string = defaultMessage(), author: string = defaultAuthor()) {
        if (!(this.username && this.accessToken)) {
            throw new Error('Must be signed in to push')
        }
        const {fs, http} = this
        const dir = `${this.workingDirRoot}/${localName}`
        await git.add({ fs, dir, filepath: '.' })
        await git.commit({ fs, dir, message, author: {name: author} })

        return await git.push({
            fs,
            http,
            dir,
            corsProxy,
            onAuth: () => ({username: this.username!, password: this.accessToken!}),
        })
    }

    async clone(url: string, localName: string) {
        const {fs, http} = this
        const dir = `${this.workingDirRoot}/${localName}`
        return await git.clone({
            fs,
            http,
            dir,
            corsProxy,
            url,
            singleBranch: true,
            depth: 10
        })
    }

    async pull(localName: string) {
        const {fs, http} = this
        const dir = `${this.workingDirRoot}/${localName}`
        await git.add({ fs, dir, filepath: '.' })
        await git.commit({ fs, dir, message: 'Save changes before update', author: {name: defaultAuthor()} })
        await git.pull({
            fs,
            http,
            dir,
            corsProxy,
            singleBranch: true,
            author: {name: defaultAuthor() }
        })
    }

    async deleteFile(localName: string, filepath: string) {
        const {fs} = this
        const dir = `${this.workingDirRoot}/${localName}`
        await git.remove({ fs, dir, filepath })
    }

    async rename(localName: string, oldFilepath: string, newFilepath: string) {
        const {fs} = this
        const dir = `${this.workingDirRoot}/${localName}`
        await git.add({ fs, dir, filepath: newFilepath })
        await git.remove({ fs, dir, filepath: oldFilepath })
    }

    // async status(localName: string) {
    //     const {fs, http} = this
    //     const dir = `${this.workingDirRoot}/${localName}`
    //     const files = await git.listFiles({fs, dir})
    //     return Promise.all(files.map(async file => {
    //         const status = await git.status({fs, dir, filepath: file})
    //         return [file, status].join(': ')
    //     }))
    // }

}