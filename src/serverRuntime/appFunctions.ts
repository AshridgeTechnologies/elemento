import { customAlphabet } from 'nanoid'
import dataFunctions from '../runtime/dataFunctions'
import {getAuth} from 'firebase-admin/auth'

type UserDetails = Partial<{email: string, displayName: string, password: string}>

const idSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4)
const CreateUser = async (uid: string, details: UserDetails) => {
    const {email, displayName, password} = details
    await getAuth().createUser({uid, email, password, displayName,})
}
const UpdateUser = async (uid: string, details: UserDetails) => {
    const {email, displayName, password} = details
    const changes = {email, displayName, password}
    await getAuth().updateUser(uid, changes)
}
const GetUser = (uid: string) => getAuth().getUser(uid)

const GetRandomId = async () => Date.now() + '-' + idSuffix()

const appFunctions = {...dataFunctions, CreateUser, GetUser, UpdateUser, GetRandomId }

export const appFunctionsNames = () => {
    // CurrentUser is generated into the server app code
    return Object.keys(appFunctions).concat('CurrentUser')
}

export default appFunctions
