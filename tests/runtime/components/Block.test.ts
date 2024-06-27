/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {componentJSON, testAppInterface, wrappedTestElement} from '../../testutil/testHelpers'
import {Block, TextElement} from '../../../src/runtime/components/index'
import {BlockState} from '../../../src/runtime/components/Block'

const [block, appStoreHook] = wrappedTestElement(Block, BlockState, true)

const text1 = createElement(TextElement, {path: 'app.page1.things.text1', styles: {width: 200, top: 20, left: 30}, content: 'First text'} )
const text2 = createElement(TextElement, {path: 'app.page1.things.text2', styles: {width: 300, bottom: 10, right: 34}, content: 'Second text'} )

const layoutText1 = createElement(TextElement, {path: 'app.page1.things.text1', styles: {width: 200}, content: 'First text'} )
const layoutText2 = createElement(TextElement, {path: 'app.page1.things.text2', styles: {width: 300}, content: 'Second text'} )

test('Block element produces output containing single child', ()=> {
        const component = block('app.page1.things', {}, {layout: 'positioned', styles: {width: 200}}, text1)
        expect(componentJSON(component)).toMatchSnapshot()
    })

test('Block element produces output containing multiple children',()=> {
    const component = block('app.page1.things', {}, {layout: 'positioned', show: true, styles: {width: 200}}, text1, text2)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Block element produces output with layout none',()=> {
    const component = block('app.page1.things', {}, {layout: 'none', show: true, styles: {width: 200}}, text1, text2)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Block element produces output containing children vertical', () => {
    const component = block('app.page1.things', {}, {layout: 'none', show: true, styles: {width: 200}}, layoutText1, layoutText2)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Block element produces output containing children horizontal', () => {
    const component = block('app.page1.things5', {}, {layout: 'horizontal', styles: {width: '70%'}}, layoutText1, layoutText2)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Block element produces output containing children horizontal and wrapped with styles', () => {
    const component = block('app.page1.things', {}, {layout: 'horizontal wrapped', show: true, styles: {width: '60%', backgroundColor: 'green'}}, layoutText1, layoutText2)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Block State only updates isOver when changed', () => {
    const state = new BlockState({})
    const appInterface = testAppInterface('testPath', state)

    state.setIsOver(false)
    expect(appInterface.updateVersion).not.toHaveBeenCalled()
    state.setIsOver(true)
    expect(appInterface.updateVersion).toHaveBeenCalledWith({isOver: true})
    expect(state.latest().isOver).toBe(true)
    state.setIsOver(true)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(1)
    state.setIsOver(false)
    expect(appInterface.updateVersion).toHaveBeenCalledTimes(2)
    expect(appInterface.updateVersion).toHaveBeenLastCalledWith({isOver: false})

})
