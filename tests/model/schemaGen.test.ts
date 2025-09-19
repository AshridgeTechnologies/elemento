import {test} from "vitest"

import {generateSchema} from '../../src/model/ModelElement'
import {FunctionDef} from '../testutil/modelHelpers'

test('gen schema', () => {

    const elementClass = FunctionDef
    const schema = generateSchema(elementClass)

    const schemaNoDefs = {...schema, definitions: 'Definitions'}
    console.log(JSON.stringify(schemaNoDefs, null, 4))
})
