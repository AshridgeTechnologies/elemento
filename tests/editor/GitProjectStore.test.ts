import GitProjectStore, {isGitWorkingCopy} from '../../src/editor/GitProjectStore'
import fs from 'fs'
import * as os from 'os'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import {projectFileName} from '../../src/editor/LocalProjectStore'
import {loadJSONFromString} from '../../src/model/loadJSON'
import {Project} from '@playwright/test'
import {wait, waitUntil} from '../testutil/testHelpers'
import {Octokit} from 'octokit'

jest.setTimeout(25000)

const {username, repo} = JSON.parse(fs.readFileSync('./private/githubTestRepo.json', 'utf8'))
const accessToken = fs.readFileSync('./private/githubTestRepoAccessToken.txt', 'utf8')

let localName: string, tempDir: string, localDirPath: string, repoToCreate: string | null
beforeEach( () => {
    tempDir = os.tmpdir()
    localName = 'MyDogsLife-' + Date.now()
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
    const store = new GitProjectStore(fs, http, null, null, tempDir)
    const url = `https://github.com/${username}/${repo}.git`
    await store.clone(url, localName)
    const projectFileContents = fs.readFileSync(`${tempDir}/${localName}/${projectFileName}`, 'utf8')
    const project = loadJSONFromString(projectFileContents) as Project
    expect(project.name).toBe('The Dogs Life Project')
})

test('clones repo from GitHub page URL', async () => {
    const store = new GitProjectStore(fs, http, null, null, tempDir)
    const url = `https://github.com/${username}/${repo}`
    await store.clone(url, localName)
    const projectFileContents = fs.readFileSync(`${tempDir}/${localName}/${projectFileName}`, 'utf8')
    const project = loadJSONFromString(projectFileContents) as Project
    expect(project.name).toBe('The Dogs Life Project')
})

test('updates repo in GitHub', async () => {
    const store = new GitProjectStore(fs, http, username, accessToken, tempDir)
    const url = `https://github.com/${username}/${repo}`
    await store.clone(url, localName)

    const currentTime = new Date().toISOString()
    fs.writeFileSync(`${tempDir}/${localName}/${currentTimeFile}`, currentTime)
    const message = 'The changes at ' + currentTime
    await store.commitAndPush(localName, message)
    const commitResults = await git.log({fs, dir: localDirPath})
    expect(commitResults[0].commit.message).toBe(message + '\n')
    const updatedFileContent = () => fetch(`https://raw.githubusercontent.com/${username}/${repo}/main/${currentTimeFile}`).then(resp => resp.text())
    await waitUntil( async () => await updatedFileContent() === currentTime, 2000, 10000 )
})

test('detects if dir is a git repo and origin remote returns null if not', async () => {
    await fs.promises.mkdir(localDirPath)
    expect(await isGitWorkingCopy(fs, localDirPath)).toBe(false)
    const store = new GitProjectStore(fs, http, null, null, tempDir)
    expect(await store.getOriginRemote(localName)).toBe(null)

    const url = `https://github.com/${username}/${repo}`
    await store.clone(url, localName)
    expect(await isGitWorkingCopy(fs, localDirPath)).toBe(true)
    expect(await store.getOriginRemote(localName)).toBe(url)
})

test('inits a dir as a git repo', async () => {
    await fs.promises.mkdir(localDirPath)
    expect(await isGitWorkingCopy(fs, localDirPath)).toBe(false)

    const store = new GitProjectStore(fs, http, null, null, tempDir)
    await store.init(localName)
    expect(await isGitWorkingCopy(fs, localDirPath)).toBe(true)
    expect(await store.getOriginRemote(localName)).toBe(null)
})

test('sets origin remote of a git repo', async () => {
    await fs.promises.mkdir(localDirPath)

    const store = new GitProjectStore(fs, http, null, null, tempDir)
    await store.init(localName)
    await store.setOriginRemote(localName, 'http://example.com/dogslife')
    expect(await store.getOriginRemote(localName)).toBe('http://example.com/dogslife')
})

test('pulls updates to a cloned git repo', async () => {
    const localName2 = localName + '_1'
    const store = new GitProjectStore(fs, http, username, accessToken, tempDir)
    const url = `https://github.com/${username}/${repo}`
    await store.clone(url, localName)
    await store.clone(url, localName2)

    const currentTime = new Date().toISOString()
    fs.writeFileSync(`${tempDir}/${localName}/${currentTimeFile}`, currentTime)
    await store.commitAndPush(localName)

    await store.pull(localName2)
    const updatedTime = fs.readFileSync(`${tempDir}/${localName2}/${currentTimeFile}`, 'utf8')
    expect(updatedTime).toBe(currentTime)
})

test('pulls updates to a cloned git repo and merges non-conflicting changes', async () => {
    const localName2 = localName + '_1'
    const textFile = 'theText.txt'
    const text = 'Line 1\nLine 2\nLine 3'
    const updateFile = (dir: string, file: string, text: string) => fs.writeFileSync(`${tempDir}/${dir}/${file}`, text)
    const fileContents = (dir: string, file: string) => fs.readFileSync(`${tempDir}/${dir}/${file}`, 'utf8')

    const store = new GitProjectStore(fs, http, username, accessToken, tempDir)
    const url = `https://github.com/${username}/${repo}`
    await store.clone(url, localName)
    await store.clone(url, localName2)

    const currentTime = new Date().toISOString()
    updateFile(localName2, currentTimeFile, currentTime)
    await store.commitAndPush(localName2)

    updateFile(localName, textFile, text)
    await store.pull(localName)
    expect(fileContents(localName, currentTimeFile)).toBe(currentTime)
    expect(fileContents(localName, textFile)).toBe(text)

    await store.commitAndPush(localName)
    await store.pull(localName2)

    expect(fileContents(localName2, textFile)).toBe(text)
    updateFile(localName2, textFile, text.replace(/Line 3/, 'Line 3a'))
    await store.commitAndPush(localName2)

    updateFile(localName, textFile, text.replace(/Line 1/, 'Line 1a'))
    await store.pull(localName)
    expect(fileContents(localName, textFile)).toBe(text.replace(/Line 1/, 'Line 1a').replace(/Line 3/, 'Line 3a'))
})

test('creates GitHub repo and pushes and can pull', async () => {
    const tempDir = os.tmpdir()
    const localName = 'MyDogsLife-' + Date.now()
    const localDirPath = `${tempDir}/${localName}`
    const now = Date.now()
    repoToCreate = 'test ' + now
    await fs.promises.mkdir(localDirPath)

    const store = new GitProjectStore(fs, http, username, accessToken, tempDir)
    await store.init(localName)

    const currentTime = new Date().toISOString()
    fs.writeFileSync(`${localDirPath}/${currentTimeFile}`, currentTime)
    const actualName = await store.createGitHubRepo(localName, repoToCreate)
    expect(actualName).toBe('test-' + now)
    expect(await store.getOriginRemote(localName)).toBe(`https://github.com/${username}/${actualName}`)
    await wait(1000)
    await store.commitAndPush(localName)
    const updatedFileContent = () => fetch(`https://raw.githubusercontent.com/${username}/${actualName}/main/${currentTimeFile}`).then( resp => resp.text())
    await waitUntil( async () => await updatedFileContent() === currentTime)
    await store.pull(localName)
})
