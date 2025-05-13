/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"
import React from 'react'
import AppBar from '../../src/appsShared/AppBar'
import MenuBar from '../../src/editor/MenuBar'
import InsertMenuWithButton from '../../src/editor/InsertMenuWithButton'
import {snapshotTest} from '../testutil/testHelpers'

// vi.mock("firebase/auth", () => ({
//     getAuth: vi.fn().mockImplementation( ()=> ({currentUser() { return {name: 'Jo'}} })),
//     onAuthStateChanged: vi.fn()
// }))
// vi.mock("firebase/app", () => ({
//     initializeApp: vi.fn(),
// }))
//
describe('Components', () => {
    snapshotTest(<AppBar title='The title'/>)
    snapshotTest(<MenuBar/>)
    snapshotTest(<InsertMenuWithButton onInsert={() => {} } insertMenuItems={() => ['Text', 'TextInput', 'NumberInput','SelectInput', 'TrueFalseInput', 'Button', 'Data', 'Page'] } targetItemId={'id1'}/>)
})
