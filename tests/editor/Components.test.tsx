/**
 * @jest-environment jsdom
 */

import React from 'react'
import AppBar from '../../src/shared/AppBar'
import MenuBar from '../../src/editor/MenuBar'
import InsertMenu from '../../src/editor/InsertMenu'
import {snapshotTest} from '../testutil/testHelpers'

describe('Components', () => {
    snapshotTest(<AppBar title='The title'/>)
    snapshotTest(<MenuBar/>)
    snapshotTest(<InsertMenu onInsert={() => {} } items={['Text', 'TextInput', 'NumberInput','SelectInput', 'TrueFalseInput', 'Button', 'Data', 'Page'] }/>)
})
