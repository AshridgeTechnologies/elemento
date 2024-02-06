import Image from '../../src/model/Image'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('Image has correct properties with default values', ()=> {
    const image1 = new Image('im1', 'Image 1', {})

    expect(image1.id).toBe('im1')
    expect(image1.name).toBe('Image 1')
    expect(image1.kind).toBe('Image')
    expect(image1.source).toBe(undefined)
    expect(image1.description).toBe(undefined)
    expect(image1.show).toBe(undefined)
    expect(image1.styles).toBe(undefined)
    expect(image1.type()).toBe('statelessUI')
})

test('Image has correct properties with specified values', ()=> {
    const image1 = new Image('im1', 'Image 1', {
        source: 'http://example.com/img1.jpg', description: 'A mountain',
        show: ex`1 && 2`,
        styles: {width: 100, height: 200, marginBottom: 20}, })

    expect(image1.id).toBe('im1')
    expect(image1.name).toBe('Image 1')
    expect(image1.source).toStrictEqual('http://example.com/img1.jpg')
    expect(image1.description).toBe('A mountain')
    expect(image1.show).toStrictEqual(ex`1 && 2`)
    expect(image1.styles).toStrictEqual({width: 100, height: 200, marginBottom: 20})
})

test('has correct property names', () => {
    expect(new Image('im1', 'Image 1', {}).propertyDefs.map( ({name}) => name )).toStrictEqual(['source', 'description', 'show', 'styles'])
})

test('tests if an object is this type', ()=> {
    const image = new Image('im1', 'Image 1', {source: ex`Some_image`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Image.is(image)).toBe(true)
    expect(Image.is(page)).toBe(false)
})

test('creates an updated object with a property set to a new value', ()=> {
    const image = new Image('im1', 'Image 1', {source: 'http://example.com/img1.jpg'})
    const updatedImage1 = image.set('im1', 'name', 'Image 1A')
    expect(updatedImage1.name).toBe('Image 1A')
    expect(updatedImage1.source).toBe('http://example.com/img1.jpg')
    expect(image.name).toBe('Image 1')
    expect(image.source).toBe('http://example.com/img1.jpg')

    const updatedImage2 = updatedImage1.set('im1', 'source', ex`shazam`)
    expect(updatedImage2.name).toBe('Image 1A')
    expect(updatedImage2.source).toStrictEqual(ex`shazam`)
    expect(updatedImage1.name).toBe('Image 1A')
    expect(updatedImage1.source).toStrictEqual('http://example.com/img1.jpg')
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const image = new Image('im1', 'Image 1', {source: ex`Some_image`})
    const updatedImage = image.set('x1', 'name', ex`Image 1A`)
    expect(updatedImage).toStrictEqual(image)
})

test('converts to JSON without optional proerties', ()=> {
    const image = new Image('im1', 'Image 1', {source: ex`Some_image`})
    expect(asJSON(image)).toStrictEqual({
        kind: 'Image',
        id: 'im1',
        name: 'Image 1',
        properties: image.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const image = new Image('im1', 'Image 1', {show: true,
        source: 'http://example.com/img1.jpg',
        styles: {width: 100, height: 200, marginBottom: 20}, description: 'A mountain'})
    expect(asJSON(image)).toStrictEqual({
        kind: 'Image',
        id: 'im1',
        name: 'Image 1',
        properties: image.properties
    })
})

test('converts from plain object', ()=> {
    const image = new Image('im1', 'Image 1', {source: ex`Some_image`})
    const plainObj = asJSON(image)
    const newImage = loadJSON(plainObj)
    expect(newImage).toStrictEqual<Image>(image)

    const image2 = new Image('im1', 'Image 2', {show: false,
        source: 'http://example.com/img1.jpg',
        styles: {width: 100, height: 200, marginBottom: 20}, description: 'A mountain'})
    const plainObj2 = asJSON(image2)
    const newImage2 = loadJSON(plainObj2)
    expect(newImage2).toStrictEqual<Image>(image2)
})
