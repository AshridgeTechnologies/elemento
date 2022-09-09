import {map} from 'ramda'
import {isBooleanString, isNumeric} from '../util/helpers'
import {parseISO} from 'date-fns'

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