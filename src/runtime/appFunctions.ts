import {updateState} from './appData'

export default {
    ShowPage(pageName: string) {
        updateState('app._data', {currentPage: pageName})
    },

    Reset(component: {update: (changes: {value: any}) => void}) {
        component.update({value: undefined})
    },
}