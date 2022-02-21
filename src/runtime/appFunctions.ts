import {updateState} from './appData'

export default {
    ShowPage(pageName: string) {
        updateState('app._data', {currentPage: pageName})
    },

    Reset(controlPath: string) {
        updateState(controlPath, {value: null})
    },
}