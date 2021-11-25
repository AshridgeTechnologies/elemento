/**
 * @jest-environment jsdom
 */

import React from 'react'
import AppBar from '../../src/editor/AppBar'
import MenuBar from '../../src/editor/MenuBar'
import InsertMenu from '../../src/editor/InsertMenu'
import {snapshotTest} from '../util/testHelpers'

describe('Components', () => {
    snapshotTest(<AppBar/>)
    snapshotTest(<MenuBar/>)
    snapshotTest(<InsertMenu onInsert={() => {} }/>)
})
