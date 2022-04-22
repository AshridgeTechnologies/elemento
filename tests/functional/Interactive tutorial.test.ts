import {expect, Frame, test} from '@playwright/test'
import {treeItem} from '../editor/Selectors'

const autorunRootUrl = '/autorun/index.html'

test.skip('Shows autorun with steps and description and navigates', async ({ page }) => {

    await page.goto(autorunRootUrl)
    //await page.evaluate( (app: string) => window.setTargetFromJSONString(app), JSON.stringify(editorAutorunFixture1()))

    const targetFrame = page.frame('targetFrame') as Frame
    const checkHighlightedInTree = async (selector: string) => {
        const treeNode = page.locator(selector)
        expect(await treeNode.getAttribute('class')).toMatch('rc-tree-node-selected')
    }

    const checkHighlightedInTarget = async (selector: string) => {
        const node = targetFrame.locator(selector)
        // expect (await node.evaluate(node => node.style.outlineStyle)).toBe('dashed')
        expect (await node.evaluate(node => document?.defaultView?.getComputedStyle (node).outlineStyle)).toBe('dashed')
    }

    // await page.click(`${treeExpandControlSelector} >> nth=0`)
    expect(await page.textContent(treeItem(0))).toBe('Introduction')
    expect(await page.textContent(treeItem(1))).toBe('Navigation panel')
    expect(await page.textContent(treeItem(2))).toBe('Properties panel')
    await checkHighlightedInTree(treeItem(0))
    expect(await page.textContent(`#title`)).toBe('Introduction')
    expect(await page.textContent(`#description`)).toBe('We are going to see how things work')

    await page.click(`text=Next`)
    await checkHighlightedInTree(treeItem(1))
    expect(await page.textContent(`#title`)).toBe('Navigation panel')
    expect(await page.textContent(`#description`)).toBe('This shows where you are')
    await checkHighlightedInTarget('#navigationPanel')

    await page.click(`text=Next`)
    await checkHighlightedInTree(treeItem(2))
    expect(await page.textContent(`#title`)).toBe('Properties panel')
    expect(await page.textContent(`#description`)).toBe('This shows the details')
    await checkHighlightedInTarget('#propertyPanel')

    await page.click(`text=Previous`)
    await page.click(`text=Previous`)
    await checkHighlightedInTree(treeItem(0))
    expect(await page.textContent(`#title`)).toBe('Introduction')
    expect(await page.textContent(`#description`)).toBe('We are going to see how things work')
} )
