import admin from 'firebase-admin'
import {map} from 'ramda'
import {isBooleanString, isNumeric} from '../util/helpers'
import {parseISO} from 'date-fns'
import {getApp} from './firebaseApp'

const parseParam = (param: string) => {
    if (isNumeric(param)) {
        return parseFloat(param)
    }

    if (isBooleanString(param)) {
        return param === true.toString()
    }

    const date = parseISO(param)
    if (!Number.isNaN(date.getTime())) {
        return date
    }

    return param
}

export function parseQueryParams(req: {query: { [key: string]: string; }}): object {
    return map(parseParam, req.query as any) as object
}

export function checkUser(req: any, res: any, next: () => void) {
    const authHeader = req.get('Authorization')
    const idToken = authHeader?.match(/Bearer *(.*)$/)[1]

    if (idToken) {
        admin.auth(getApp()).verifyIdToken(idToken)
            .then((userDetails) => {
                console.log('user id', userDetails.uid)
                req.currentUser = userDetails
                next()
            })
            .catch((error) => {
                throw error
            })
    } else {
        next()
    }

}