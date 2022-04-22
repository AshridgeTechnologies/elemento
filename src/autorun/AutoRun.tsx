import React, {useEffect, useState} from 'react'
import Step, {Script} from '../model/autorun/Step'
import AppStructureTree, {ModelTreeItem} from '../editor/AppStructureTree'
import {Box, Button, Typography} from '@mui/material'

const treeData = (script: Script): ModelTreeItem => {
    const treeNodeFromStep = (step: Step, index: number) => new ModelTreeItem(index.toString(), step.title, 'Text')
    return new ModelTreeItem('theScript', 'Script', 'Page', script.map(treeNodeFromStep))
}

export default function AutoRun({script}: { script: Step[] }) {
    const [selectedItemId, setSelectedItemId] = useState('0')
    const selectedItemIndex = +selectedItemId

    const currentStep = script[selectedItemIndex]
    const updateHighlightedItem = ()=> {
        const targetFrame = document.querySelector('iframe[name=targetFrame]') as HTMLIFrameElement
        const targetHead = targetFrame?.contentWindow?.document.head
        if (targetHead && !targetHead.querySelector('#elemento-style')) {
            targetHead.insertAdjacentHTML('beforeend', `<style id="elemento-style">.elemento-highlight { outline: dashed 2px orangered;}</style>`)
        }
        const targetBody = targetFrame?.contentWindow?.document.body
        if (targetBody) {
            targetBody.querySelectorAll('.elemento-highlight').forEach( el => el.classList.remove('elemento-highlight'))
            const highlightSelector = currentStep.elementSelector
            if (highlightSelector) {
                targetBody.querySelectorAll(highlightSelector).forEach( el => el.classList.add('elemento-highlight'))
            }
        }
    }

    useEffect(updateHighlightedItem)

    const moveToNext = () => setSelectedItemId((selectedItemIndex + 1).toString())
    const moveToPrevious = () => setSelectedItemId((selectedItemIndex - 1).toString() )

    return <div>
        <div style={{display: 'flex', flexDirection: 'row', marginTop: 15}}>
            <div style={{backgroundColor: 'lightgreen', width: '20%', height: 400}}>
                <AppStructureTree treeData={treeData(script)} onSelect={setSelectedItemId} selectedItemId={selectedItemId} onAction={() => {}}/>
            </div>
            <div style={{width: '79%',}}>
                <div style={{width: '98%', margin: 'auto'}}>
                    <iframe name='targetFrame' src="/studio/" style={{width: '100%', height: 600}} onLoad={updateHighlightedItem}/>
                </div>
            </div>
        </div>
        <div style={{backgroundColor: 'lightgreen', width: '100%'}}>
            <Typography id='title' style={{fontSize: 'large'}} gutterBottom>{currentStep.title}</Typography>
            <Typography id='description' style={{}}>{currentStep.description}</Typography>
            <Box>
                <Button disabled={selectedItemIndex < 1} onClick={moveToPrevious}>Previous</Button>
                <Button disabled={selectedItemIndex === script.length - 1} onClick={moveToNext}>Next</Button>
            </Box>
        </div>
    </div>
}
