import React, {createElement} from 'react'
import * as Elemento from '../index'

type Properties = {id: string, pages: { [key: string]: React.FunctionComponent<any>; }}

export default function App({id, pages}: Properties) {
    const defaultPage = Object.keys(pages)[0]
    const state = Elemento.useObjectStateWithDefaults(`${id}._data`, {currentPage: defaultPage})
    const {currentPage} = state
    const pagePath = id + '.' + currentPage

    return createElement('div', {id},
            createElement(pages[currentPage], {path: pagePath}))
}