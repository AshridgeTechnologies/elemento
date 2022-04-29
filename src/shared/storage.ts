import {getDownloadURL, getStorage, ref, uploadString} from 'firebase/storage'
import {app} from './firebaseApp'

const storage = getStorage(app)

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