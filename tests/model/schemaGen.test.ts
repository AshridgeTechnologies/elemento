import {test} from "vitest"

import {generateSchema} from '../../src/model/ModelElement'
import {FileFolder} from '../testutil/modelHelpers'

test('gen schema', () => {

    const elementClass = FileFolder
    const schema = generateSchema(elementClass)

    const schemaNoDefs = {...schema, definitions: 'Definitions'}
    console.log(JSON.stringify(schemaNoDefs, null, 4))
})
