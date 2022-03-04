/**
 * @jest-environment jsdom
 */

import React from 'react'
import AppBar from '../../src/editor/AppBar'
import MenuBar from '../../src/editor/MenuBar'
import InsertMenu from '../../src/editor/InsertMenu'
import {snapshotTest} from '../testutil/testHelpers'

describe('Components', () => {
    snapshotTest(<AppBar/>)
    snapshotTest(<MenuBar/>)
    snapshotTest(<InsertMenu onInsert={() => {} } items={['Text', 'TextInput', 'NumberInput','SelectInput', 'TrueFalseInput', 'Button', 'Data', 'Page'] }/>)
})
