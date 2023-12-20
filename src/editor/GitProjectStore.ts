import git, {CallbackFsClient, HttpClient, PromiseFsClient} from 'isomorphic-git'
import {gitHubUsername} from '../appsShared/gitHubAuthentication'
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
export default class GitProjectStore {
    constructor(private fs: Fs, private http: HttpClient,
                private username: string | null = null, private accessToken: string | null = null, private workingDirRoot: string = '') {
    }

    async init() {
        const {fs} = this
        const dir = `${this.workingDirRoot}/`
        await git.init({ fs, dir, defaultBranch: 'main' })
    }

    async createGitHubRepo(repoName: string) {
        const octokit = new Octokit({ auth: this.accessToken })
        const response = await octokit.rest.repos.createForAuthenticatedUser({
            name: repoName,
        })
        const {html_url: repoUrl, name: actualRepoName} = response.data
        // console.log('Created repo', repoUrl)
        await this.setOriginRemote(repoUrl)
        return actualRepoName
    }

    async isGitWorkingCopy(): Promise<boolean> {
        return await exists(this.fs, `${this.workingDirRoot}/.git/config`)
    }

    async getOriginRemote() {
        const {fs} = this
        const dir = `${this.workingDirRoot}/`
        if (await this.isGitWorkingCopy()) {
            return (await git.getConfig({fs, dir, path: 'remote.origin.url'})) ?? null
        }

        return null
    }

    async setOriginRemote(url: string) {
        const {fs} = this
        const dir = `${this.workingDirRoot}/`
        await git.setConfig({fs, dir, path: 'remote.origin.url', value: url})
        await git.setConfig({fs, dir, path: 'remote.origin.fetch', value: '+refs/heads/*:refs/remotes/origin/*'})
    }

    async isConnectedToGitHubRepo() {
        return !! await this.getOriginRemote()
    }

    async addAllChanged() {
        const {fs} = this
        const dir = `${this.workingDirRoot}/`
        await git.add({ fs, dir, filepath: '.' })
    }

    async commitAndPush(message: string = defaultMessage(), author: string = defaultAuthor()) {
        if (!(this.username && this.accessToken)) {
            throw new Error('Must be signed in to push')
        }
        const {fs, http} = this
        const dir = `${this.workingDirRoot}/`
        await this.addAllChanged()
        await git.commit({ fs, dir, message, author: {name: author} })

        return await git.push({
            fs,
            http,
            dir,
            corsProxy,
            onAuth: () => ({username: this.username!, password: this.accessToken!}),
        })
    }

    async clone(url: string) {
        const {fs, http} = this
        const dir = `${this.workingDirRoot}/`
        return await git.clone({
            fs,
            http,
            dir,
            corsProxy,
            url,
            singleBranch: true,
            depth: 1
        })
    }

    async pull() {
        const {fs, http} = this
        const dir = `${this.workingDirRoot}/`
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

    async deleteFile(filepath: string) {
        const {fs} = this
        const dir = `${this.workingDirRoot}/`
        await git.remove({ fs, dir, filepath })
    }

    async rename(oldFilepath: string, newFilepath: string) {
        const {fs} = this
        const dir = `${this.workingDirRoot}/`
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

    async isModified() {
        const {fs} = this
        const dir = `${this.workingDirRoot}`
        const statusMatrix = await git.statusMatrix({fs, dir})
        const isRowModified = ([, head, workdir, stage]: [name: string, head: number, workdir: number, stage: number]) =>
            !( (head === 0 && workdir === 0 && stage === 0) || (head === 1 && workdir === 1 && stage === 1))
        return statusMatrix.some(isRowModified)
    }
}