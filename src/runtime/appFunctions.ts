const appFunctions = (state: {_updateApp: (changes: object) => void }) => {
    const {_updateApp} = state
    return ({
        ShowPage(pageName: string) {
            _updateApp( {_data: {currentPage: pageName}})
        },

        Reset(component: {_update: (changes: {value: any}) => void}) {
            component._update({value: undefined})
        },

        Set(component: {_update: (value: any, replace?: boolean) => void}, value: any) {
            component._update({value}, true)
        },

        Update(component: {_update: (changes: object) => void}, changes: object) {
            component._update({value: changes})
        },
    })
}

export default appFunctions