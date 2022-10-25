import {valueOf} from './runtimeFunctions'
import authentication from './components/authentication'
import dataFunctions from './dataFunctions'

const {currentUser} = authentication

const appFunctions = {

    Reset(...components: { Reset: () => void }[]) {
        components.forEach(comp => comp.Reset())
    },

    Set(component: { Set: (value: any) => void }, value: any) {
        component.Set(valueOf(value))
    },

    NotifyError(description: string, error: Error) {
        //temporary implementation
        console.error(description, error)
        alert(`${description}\n${error.message}`)
    },

    CurrentUser() {
        const user = currentUser()
        return user ? {...user, Name: user.displayName, Email: user.email} : null
    },

    ...dataFunctions
}

export const appFunctionsNames = () => {
    return Object.keys(appFunctions)
}

export default appFunctions