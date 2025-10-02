/**
 * @vitest-environment jsdom
 */
import {expect, test} from "vitest"
import {createElement} from 'react'
import {componentJSON, createStateFn, wrappedTestElement} from '../../testutil/testHelpers'
import {Block, TextElement} from '../../../src/runtime/components/index'
import {BlockState} from '../../../src/runtime/components/Block'

const [block] = wrappedTestElement(Block, true)

const createState = createStateFn(BlockState)

const text1 = createElement(TextElement, {path: 'app.page1.things.text1', styles: {width: 200, top: 20, left: 30}, content: 'First text'} )
const text2 = createElement(TextElement, {path: 'app.page1.things.text2', styles: {width: 300, bottom: 10, right: 34}, content: 'Second text'} )

const layoutText1 = createElement(TextElement, {path: 'app.page1.things.text1', styles: {width: 200}, content: 'First text'} )
const layoutText2 = createElement(TextElement, {path: 'app.page1.things.text2', styles: {width: 300}, content: 'Second text'} )

test('Block element produces output containing single child', ()=> {
        const component = block('app.page1.things', {layout: 'positioned', styles: {width: 200}}, text1)
        expect(componentJSON(component)).toMatchSnapshot()
    })

test('Block element produces output containing multiple children',()=> {
    const component = block('app.page1.things', {layout: 'positioned', show: true, styles: {width: 200}}, text1, text2)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Block element produces output with layout none',()=> {
    const component = block('app.page1.things', {layout: 'none', show: true, styles: {width: 200}}, text1, text2)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Block element produces output containing children vertical', () => {
    const component = block('app.page1.things', {layout: 'none', show: true, styles: {width: 200}}, layoutText1, layoutText2)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Block element produces output containing children horizontal', () => {
    const component = block('app.page1.things5', {layout: 'horizontal', styles: {width: '70%'}}, layoutText1, layoutText2)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Block element produces output containing children horizontal and wrapped with styles', () => {
    const component = block('app.page1.things', {layout: 'horizontal wrapped', show: true, styles: {width: '60%', backgroundColor: 'green'}}, layoutText1, layoutText2)
    expect(componentJSON(component)).toMatchSnapshot()
})

test('Block State only updates isOver when changed', () => {
    const state = createState({})
    const {store} = createState

    state.setIsOver(false) // no change
    console.log('state._path', state._path)
    const latestState = store.get(state._path!)
    expect(latestState).toBe(state)

    state.setIsOver(true)  // changed
    expect(state.isOver).toBe(true)
    const state2 = store.get(state._path!)
    expect(state2).not.toBe(state)

    state.setIsOver(true) // no change
    expect(store.get(state._path!)).toBe(state2)

    state.setIsOver(false)
    expect(store.get(state._path!)).not.toBe(state2)
    expect(state.isOver).toBe(false)
})
