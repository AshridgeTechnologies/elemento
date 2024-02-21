import {useEffect, useState} from 'react'

export const useDebugExpr = () => {
    const [, setDebugExprUpdateTime] = useState(0)
    useEffect(() => {
        const listener = ((event: CustomEvent<string>)=> {
            setDebugExprUpdateTime(Date.now())
        })as EventListener
        console.log('adding debugExpr event listener')
        window.addEventListener('debugExpr', listener)
        return () => {
            console.log('removing debugExpr event listener')
            window.removeEventListener('debugExpr', listener)
        }
    }, [])
    return (window as any).elementoDebugExpr ?? null
}

export const elementoDebug = (val: any) => {
    console.log('elementoDebug', val)
    const event = new CustomEvent('debugData', { detail: val })
    window.dispatchEvent(event)
}
