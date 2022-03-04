import React, {useState} from 'react'
import AutoRun from './AutoRun'
import {editorAutorunFixture1} from '../../tests/testutil/autorunFixtures'

export default function AutoRunMain() {
    // const [script, setScript] = useState([])

    const script = editorAutorunFixture1()
    return <AutoRun script={script}/>
}