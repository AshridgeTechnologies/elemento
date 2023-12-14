import GitProjectStore from '../../src/editor/GitProjectStore'
import fs from 'fs'
import * as os from 'os'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import {loadJSONFromString} from '../../src/model/loadJSON'
import {Project} from '@playwright/test'
import {wait, waitUntil} from '../testutil/testHelpers'
import {Octokit} from 'octokit'
import {projectFileName} from '../../src/shared/constants'

jest.setTimeout(25000)

const {username, repo} = JSON.parse(fs.readFileSync('./private/githubTestRepo.json', 'utf8'))
const accessToken = fs.readFileSync('./private/githubTestRepoAccessToken.txt', 'utf8')
const waitForGitHub = (fn: () => Promise<boolean>) => waitUntil( fn, 2000, 15000 )

let tempDir: string, localDirPath: string, repoToCreate: string | null
beforeEach( () => {
    tempDir = os.tmpdir()
    const localName = 'MyDogsLife-' + Date.now()
    localDirPath = `${tempDir}/${localName}`
    repoToCreate = null
})

afterEach( () => {
    try {
        // fs.rmSync(localDirPath, {recursive: true, maxRetries: 5})
    } catch (e) {
        if ((e as any).code !== 'ENOENT') {
            console.error('Could not remove ', localDirPath, e)
        }
    }
})

const deleteGitHubRepo = async (repo: string) => {
    try {
        const octokit = new Octokit({auth: accessToken})
        return await octokit.rest.repos.delete({owner: username, repo: repo.replace(' ', '-')})
    } catch (e) {
        console.error('Could not delete repo', repo, e)
    }
}

afterEach(async () => {
    if (repoToCreate) {
        const result = await deleteGitHubRepo(repoToCreate)
        // console.log('Deleted repo', repoToCreate, /*result*/)
    }
})

const currentTimeFile = 'currentTime.txt'

test('clones repo from GitHub with clone URL', async () => {
    const store = new GitProjectStore(fs, http, null, null, localDirPath)
    const url = `https://github.com/${username}/${repo}.git`
    await store.clone(url)
    const projectFileContents = fs.readFileSync(`${localDirPath}/${projectFileName}`, 'utf8')
    const project = loadJSONFromString(projectFileContents) as Project
    expect(project.name).toBe('The Dogs Life Project')
    await expect(store.isModified()).resolves.toBe(false)
})

test('clones repo from GitHub page URL', async () => {
    const store = new GitProjectStore(fs, http, null, null, localDirPath)
    const url = `https://github.com/${username}/${repo}`
    await store.clone(url)
    const projectFileContents = fs.readFileSync(`${localDirPath}/${projectFileName}`, 'utf8')
    const project = loadJSONFromString(projectFileContents) as Project
    expect(project.name).toBe('The Dogs Life Project')
})

test('updates repo in GitHub', async () => {
    const store = new GitProjectStore(fs, http, username, accessToken, localDirPath)
    const url = `https://github.com/${username}/${repo}`
    await store.clone(url)

    const currentTime = new Date().toISOString()
    fs.writeFileSync(`${localDirPath}/${currentTimeFile}`, currentTime)
    await expect(store.isModified()).resolves.toBe(false)

    await store.addAllChanged()
    await expect(store.isModified()).resolves.toBe(true)

    const message = 'The changes at ' + currentTime
    await store.commitAndPush(message)
    const commitResults = await git.log({fs, dir: localDirPath})
    expect(commitResults[0].commit.message).toBe(message + '\n')
    const updatedFileContent = () => fetch(`https://raw.githubusercontent.com/${username}/${repo}/main/${currentTimeFile}`).then(resp => resp.text())
    await waitUntil( async () => await updatedFileContent() === currentTime, 2000, 12000 )
    await expect(store.isModified()).resolves.toBe(false)
})

test('adds and deletes files in repo in GitHub', async () => {
    const store = new GitProjectStore(fs, http, username, accessToken, localDirPath)
    const url = `https://github.com/${username}/${repo}`
    await store.clone(url)

    const newFile = `NewFile-${new Date().toISOString()}.txt`
    fs.writeFileSync(`${localDirPath}/${newFile}`, 'New stuff')
    await store.commitAndPush('Add new stuff')

    const fileStatus = () => fetch(`https://github.com/${username}/${repo}/blob/main/${newFile}`).then(resp => resp.status)
    await waitForGitHub( async () => await fileStatus() === 200 )

    fs.unlinkSync(`${localDirPath}/${newFile}`)
    await store.deleteFile(newFile)
    await expect(store.isModified()).resolves.toBe(true)

    await store.commitAndPush('Delete new stuff')
    await expect(store.isModified()).resolves.toBe(false)

    await waitForGitHub( async () => await fileStatus() === 404 )
})

test('renames files in repo in GitHub', async () => {
    const store = new GitProjectStore(fs, http, username, accessToken, localDirPath)
    const url = `https://github.com/${username}/${repo}`
    await store.clone(url)

    const newFile = `NewFile-${new Date().toISOString()}.txt`
    const renamedFile = newFile.replace(/NewFile/, 'RenamedFile')
    fs.writeFileSync(`${localDirPath}/${newFile}`, 'New stuff')
    await store.commitAndPush('Add new stuff')

    const fileStatus = (file: string) => fetch(`https://github.com/${username}/${repo}/blob/main/${file}`).then(resp => resp.status)
    await waitForGitHub( async () => await fileStatus(newFile) === 200 )

    fs.renameSync(`${localDirPath}/${newFile}`, `${localDirPath}/${renamedFile}`)
    await store.rename(newFile, renamedFile)
    await expect(store.isModified()).resolves.toBe(true)
    await store.commitAndPush('Rename new stuff')

    await expect(store.isModified()).resolves.toBe(false)

    await waitForGitHub( async () => await fileStatus(newFile) === 404 )
    await waitForGitHub( async () => await fileStatus(renamedFile) === 200 )
})

test('detects if dir is a git repo and origin remote returns null if not', async () => {
    await fs.promises.mkdir(localDirPath)
    const store = new GitProjectStore(fs, http, null, null, localDirPath)
    expect(await store.isGitWorkingCopy()).toBe(false)
    expect(await store.getOriginRemote()).toBe(null)

    const url = `https://github.com/${username}/${repo}`
    await store.clone(url)
    expect(await store.isGitWorkingCopy()).toBe(true)
    expect(await store.getOriginRemote()).toBe(url)
})

test('inits a dir as a git repo', async () => {
    await fs.promises.mkdir(localDirPath)

    const store = new GitProjectStore(fs, http, null, null, localDirPath)
    expect(await store.isGitWorkingCopy()).toBe(false)
    await store.init()
    expect(await store.isGitWorkingCopy()).toBe(true)
    expect(await store.getOriginRemote()).toBe(null)
})

test('sets origin remote of a git repo', async () => {
    await fs.promises.mkdir(localDirPath)

    const store = new GitProjectStore(fs, http, null, null, localDirPath)
    await store.init()
    await store.setOriginRemote('http://example.com/dogslife')
    expect(await store.getOriginRemote()).toBe('http://example.com/dogslife')
})

test('pulls updates to a cloned git repo', async () => {
    const localDirPath2 = localDirPath + '_1'
    const store = new GitProjectStore(fs, http, username, accessToken, localDirPath)
    const store2 = new GitProjectStore(fs, http, username, accessToken, localDirPath2)
    const url = `https://github.com/${username}/${repo}`
    await store.clone(url)
    await store2.clone(url)

    const currentTime = new Date().toISOString()
    fs.writeFileSync(`${localDirPath}/${currentTimeFile}`, currentTime)
    await store.commitAndPush()

    await store2.pull()
    const updatedTime = fs.readFileSync(`${localDirPath2}/${currentTimeFile}`, 'utf8')
    expect(updatedTime).toBe(currentTime)
})

test('pulls updates to a cloned git repo and merges non-conflicting changes', async () => {
    const localDirPath2 = localDirPath + '_1'
    const textFile = 'theText.txt'
    const text = 'Line 1\nLine 2\nLine 3'
    const updateFile = (dir: string, file: string, text: string) => fs.writeFileSync(`${dir}/${file}`, text)
    const fileContents = (dir: string, file: string) => fs.readFileSync(`${dir}/${file}`, 'utf8')

    const store = new GitProjectStore(fs, http, username, accessToken, localDirPath)
    const store2 = new GitProjectStore(fs, http, username, accessToken, localDirPath2)
    const url = `https://github.com/${username}/${repo}`
    await store.clone(url)
    await store2.clone(url)

    const currentTime = new Date().toISOString()
    updateFile(localDirPath2, currentTimeFile, currentTime)
    await store2.commitAndPush()

    updateFile(localDirPath, textFile, text)
    await store.pull()
    expect(fileContents(localDirPath, currentTimeFile)).toBe(currentTime)
    expect(fileContents(localDirPath, textFile)).toBe(text)

    await store.commitAndPush()
    await store2.pull()

    expect(fileContents(localDirPath2, textFile)).toBe(text)
    updateFile(localDirPath2, textFile, text.replace(/Line 3/, 'Line 3a'))
    await store2.commitAndPush()

    updateFile(localDirPath, textFile, text.replace(/Line 1/, 'Line 1a'))
    await store.pull()
    expect(fileContents(localDirPath, textFile)).toBe(text.replace(/Line 1/, 'Line 1a').replace(/Line 3/, 'Line 3a'))
})

test('creates GitHub repo and pushes and can pull', async () => {
    const now = Date.now()
    repoToCreate = 'test ' + now
    await fs.promises.mkdir(localDirPath)

    const store = new GitProjectStore(fs, http, username, accessToken, localDirPath)
    await store.init()

    const currentTime = new Date().toISOString()
    fs.writeFileSync(`${localDirPath}/${currentTimeFile}`, currentTime)
    const actualName = await store.createGitHubRepo(repoToCreate)
    expect(actualName).toBe('test-' + now)
    expect(await store.getOriginRemote()).toBe(`https://github.com/${username}/${actualName}`)
    await wait(1000)
    await store.commitAndPush()
    const updatedFileContent = () => fetch(`https://raw.githubusercontent.com/${username}/${actualName}/main/${currentTimeFile}`).then( resp => resp.text())
    await waitForGitHub( async () => await updatedFileContent() === currentTime)
    await store.pull()
})
