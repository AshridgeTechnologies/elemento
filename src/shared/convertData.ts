import {mapObjIndexed} from 'ramda'
import BigNumber from 'bignumber.js'
import {convertIsoDate, isoDateRegex} from '../util/helpers'
import {DataStoreObject, Id} from '../runtime/DataStore'

const DECIMAL_PREFIX = '#Dec'
const convertToDbValue = (value: any) => value instanceof BigNumber ? DECIMAL_PREFIX + value : value
export const convertToDbData = (data: any) => mapObjIndexed(convertToDbValue, data)
const convertFromDbValue = (value: any) => {
    if (typeof value === 'string' && value.match(isoDateRegex)) {
        return convertIsoDate(value)
    }
    if (typeof value === 'string' && value.startsWith(DECIMAL_PREFIX)) {
        return new BigNumber(value.substring(DECIMAL_PREFIX.length))
    }

    return value
}
export const convertFromDbData = (data: any) => mapObjIndexed(convertFromDbValue, data)
export const addIdToItem = (item: DataStoreObject, id: Id) => ({id, ...item})
