import React, {useState} from 'react'
import Step, {Script} from '../model/autorun/Step'
import AppStructureTree, {ModelTreeItem} from '../editor/AppStructureTree'
import {Typography} from '@mui/material'

const treeData = (script: Script): ModelTreeItem => {
    const treeNodeFromStep = (step: Step, index: number) => new ModelTreeItem(index.toString(), step.title)
    return new ModelTreeItem('theScript', 'Script', script.map(treeNodeFromStep))
}

export default function AutoRun({script}: { script: Step[] }) {
    const [selectedItemId, setSelectedItemId] = useState('');

    const currentStep = script[+selectedItemId]
    return <div>
        <div style={{display: 'flex', flexDirection: 'row', marginTop: 15}}>
            <div style={{backgroundColor: 'lightgreen', width: '20%', height: 400}}>
                <AppStructureTree treeData={treeData(script)} onSelect={setSelectedItemId} selectedItemId={selectedItemId}/>
            </div>
            <div style={{width: '79%',}}>
                <div style={{width: '98%', margin: 'auto'}}>
                    <iframe name='targetFrame' src="/editor/index.html" style={{width: '100%', height: 600}}/>
                </div>
            </div>
        </div>
        <div>
            <div style={{backgroundColor: 'lightgreen', width: '100%'}}>
                <Typography id='title' style={{fontSize: 'large'}} gutterBottom>{currentStep.title}</Typography>
                <Typography id='description' style={{}}>{currentStep.description}</Typography>
            </div>
        </div>
    </div>
}
