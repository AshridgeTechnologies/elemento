import {useEffect, useState} from 'react'

export const useDebugExpr = () => {
    const [, setDebugExprUpdateTime] = useState(0)
    useEffect(() => {
        const listener = ((event: CustomEvent<string>)=> {
            setDebugExprUpdateTime(Date.now())
        })as EventListener
        window.addEventListener('debugExpr', listener)
        return () => {
            window.removeEventListener('debugExpr', listener)
        }
    }, [])
    return (window as any).elementoDebugExpr ?? null
}

export const elementoDebug = (val: any) => {
    const event = new CustomEvent('debugData', { detail: val })
    window.dispatchEvent(event)
}
