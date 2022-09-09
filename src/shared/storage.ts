import {getDownloadURL, getStorage, ref, uploadString, uploadBytes} from 'firebase/storage'
import {app} from './firebaseApp'

export const TEMP_STORAGE_BUCKET = 'elemento-apps-temp-upload'
const storage = getStorage(app)
const tempStorage = getStorage(app, `gs://${TEMP_STORAGE_BUCKET}`)

export type StoragePath = string

export function getTextFromStorage(path: StoragePath) {
    const storageRef = ref(storage, path)
    return getDownloadURL(storageRef)
        .then(url => fetch(url))
        .then(resp => resp.text())
}

export function uploadTextToStorage(path: StoragePath, text: string, metadata: object) {
    const storageRef = ref(storage, path)
    return uploadString(storageRef, text, 'raw', metadata)
}

export function uploadDataToTempStorage(path: StoragePath, data: Uint8Array, metadata: object) {
    const storageRef = ref(tempStorage, path)
    return uploadBytes(storageRef, data, metadata)

}