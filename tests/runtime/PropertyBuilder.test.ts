import PropertyBuilder from '../../src/runtime/PropertyBuilder'

test('builds properties from plain values or functions', () => {
    const builder = new PropertyBuilder({
        foo: 42,
        bar: () => 'Bar'
    })

    expect(builder.properties).toStrictEqual({foo: 42, bar: 'Bar'})
    expect(builder.errors).toStrictEqual({})
    expect(builder.hasErrors).toBe(false)
})

test('collects errors and substitutes null', () => {
    const builder = new PropertyBuilder({
        foo: 42,
        bar: () => 'Bar',
        ping: ()=> { throw new Error('Too big')},
        pong: ()=> { throw new Error('Too small')}
    })

    expect(builder.properties).toStrictEqual({foo: 42, bar: 'Bar', ping: null, pong: null})
    expect(builder.errors).toStrictEqual({
        ping: new Error('Too big'),
        pong: new Error('Too small'),
    })
    expect(builder.hasErrors).toBe(true)
})
