import React from 'react'
import renderer from 'react-test-renderer'
import {TextElement} from '../../src/runtime/TextElement.js'

test('TextElement element produces output containing children', ()=> {
    const component = renderer.create(React.createElement(TextElement, null, 'Hello', 'where are you'))
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})