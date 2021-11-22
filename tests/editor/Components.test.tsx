/**
 * @jest-environment jsdom
 */

import React from 'react'
import renderer from 'react-test-renderer'
import AppBar from '../../src/editor/AppBar'
import MenuBar from '../../src/editor/MenuBar'
import InsertMenu from '../../src/editor/InsertMenu'

let componentJSON = (component: JSX.Element) => renderer.create(component).toJSON()

let snapshotTest = (element: JSX.Element) => test(`${element.type.name} has expected structure`, () => expect(componentJSON(element)).toMatchSnapshot())

snapshotTest(<AppBar/>)
snapshotTest(<MenuBar/>)
snapshotTest(<InsertMenu onInsert={() => {} }/>)
