import AppUtils from '../../src/runtime/AppUtils'

test('adjusts local urls for resource url', () => {
    const appUtils: AppUtils = new AppUtils('https://example.com:8090/theApp/somewhere')

    expect(appUtils.getFullUrl('/myImage.jpg')).toBe('https://example.com:8090/theApp/somewhere/myImage.jpg')
    expect(appUtils.getFullUrl('special/files/myImage.jpg')).toBe('https://example.com:8090/theApp/somewhere/special/files/myImage.jpg')
})

test('adjusts local url for no resource url', () => {
    const appUtils: AppUtils = new AppUtils(undefined)

    expect(appUtils.getFullUrl('myImage.jpg')).toBe('/myImage.jpg')
    expect(appUtils.getFullUrl('/special/files/myImage.jpg')).toBe('/special/files/myImage.jpg')
})

test('does not adjust external urls', () => {
    const appUtils: AppUtils = new AppUtils('https://example.com:8090/theApp/somewhere')
    expect(appUtils.getFullUrl('https://mysite.com/myImage.jpg')).toBe('https://mysite.com/myImage.jpg')
})

test('does not adjust undefined urls', () => {
    const appUtils: AppUtils = new AppUtils('https://example.com:8090/theApp/somewhere')
    expect(appUtils.getFullUrl(undefined)).toBe(undefined)
})
