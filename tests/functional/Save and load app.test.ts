import {expect, test} from '@playwright/test'
import {App, Page, Text, TextInput} from '../../src/model/index'
import {appFixture1} from '../util/appFixtures'
import {treeExpandControlSelector, treeItemSelector} from '../editor/Selectors'
import * as fs from 'fs'
import {loadJSONFromString} from '../../src/model/loadJSON'

// Expects test server such as Parcel dev server running on port 1234
const runtimeRootUrl = 'http://localhost:1234/editor/index.html'
const testDir = './tempTestFiles'
const testFile1 = `${testDir}/appFixture1.json`
const testFile2 = `${testDir}/newApp.json`

test('load app from file into editor', async ({page}) => {
    test.fail(true, 'WIP = Save and load app')
    await page.goto(runtimeRootUrl)
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir)
    }
    fs.writeFileSync(testFile1, JSON.stringify(appFixture1()))

    await page.click('button#open')

    // select the app file

    expect(await page.textContent(`${treeItemSelector} >> nth=0`)).toBe('Main Page')

    await page.click(`${treeExpandControlSelector} >> nth=0`)
    expect(await page.textContent(`${treeItemSelector} >> nth=2`)).toBe('Second Text')

    await page.click(`${treeItemSelector} >> nth=2`)
    expect(await page.locator('input#content').inputValue()).toBe('"The second bit of text"')

})

test('save previously loaded app to file', async ({page}) => {
    test.fail(true, 'WIP = Save and load app')
    await page.goto(runtimeRootUrl)
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir)
    }
    fs.writeFileSync(testFile1, JSON.stringify(appFixture1()))

    await page.click('button#open')

    // select the app file

    expect(await page.textContent(`${treeItemSelector} >> nth=0`)).toBe('Main Page')

    await page.click(`${treeExpandControlSelector} >> nth=0`)
    expect(await page.textContent(`${treeItemSelector} >> nth=2`)).toBe('Second Text')

    await page.click(`${treeItemSelector} >> nth=2`)
    expect(await page.locator('input#content').inputValue()).toBe('"The second bit of text"')

    await page.fill('input#content', '"The updated second text"')
    expect(await page.locator('input#content').inputValue()).toBe('"The updated second text"')

    await page.click('button#save')

    const updatedAppText = fs.readFileSync(testFile1, {encoding:'utf8'})
    const updatedApp = loadJSONFromString(updatedAppText) as App
    expect((updatedApp.pages[0].elementArray()[1] as Text).contentExpr).toBe('"The updated second text"')
})

test('save new app to file', async ({page}) => {
    test.fail(true, 'WIP = Save and load app')
    await page.goto(runtimeRootUrl)
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir)
    }
    fs.writeFileSync(testFile1, JSON.stringify(appFixture1()))

    // expect editorInitialApp to be loaded

    expect(await page.textContent(`${treeItemSelector} >> nth=0`)).toBe('Main Page')

    await page.click(`${treeExpandControlSelector} >> nth=0`)
    expect(await page.textContent(`${treeItemSelector} >> nth=2`)).toBe('Second Text')

    await page.click(`${treeItemSelector} >> nth=2`)
    expect(await page.locator('input#content').inputValue()).toBe('"The second bit of text"')

    await page.fill('input#content', '"The updated second text"')
    expect(await page.locator('input#content').inputValue()).toBe('"The updated second text"')

    await page.click('button#save')

    // navigate to test dir and save as test file 2

    const updatedAppText = fs.readFileSync(testFile1, {encoding:'utf8'})
    const updatedApp = loadJSONFromString(updatedAppText) as App
    expect((updatedApp.pages[0].elementArray()[1] as Text).contentExpr).toBe('"The updated second text"')
})