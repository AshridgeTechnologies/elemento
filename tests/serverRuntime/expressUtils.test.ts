import {expressUtils} from '../../src/serverRuntime'

const {parseQueryParams} = expressUtils

test('parses query params to most likely type', () => {
    const params = {
        foo: 'Dentist',
        bar: '27',
        trix: 'false',
        trax: 'true',
        startDate: '2022-07-21',
        startTime: '2022-11-03T08:30:48.353Z'
    }

    const parsedParams = parseQueryParams({query: params})
    expect(parsedParams).toStrictEqual({
        foo: 'Dentist',
        bar: 27,
        trix: false,
        trax: true,
        startDate: new Date(2022, 6, 21),
        startTime: new Date(2022, 10, 3, 8, 30, 48, 353)
    })
})