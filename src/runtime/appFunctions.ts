import {Value, valueOf} from './runtimeFunctions'
import {currentUser} from './components/authentication'
import dataFunctions from './dataFunctions'
import {addNotification, type NotificationLevel} from './components/notifications'

const appFunctions = {

    Reset(...components: { Reset: () => void }[]) {
        components.forEach(comp => comp.Reset())
    },

    Set(component: { Set: (value: any) => void }, value: any) {
        component.Set(valueOf(value))
    },

    NotifyError(description: string, error: Error) {
        appFunctions.Notify('error', description, error.message)
    },

    Notify(level: Value<NotificationLevel>, message: Value<string>, details?: Value<string>) {
        addNotification(valueOf(level), valueOf(message), valueOf(details))
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
