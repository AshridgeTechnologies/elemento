import Step from '../../../src/model/autorun/Step'

test('has correct properties', () => {
    const s = new Step('aTitle', 'aDescription')
    expect(s.title).toBe('aTitle')
    expect(s.description).toBe('aDescription')
    expect(s.elementSelector).toBeUndefined()

    const s2 = new Step('aTitle2', 'aDescription2', '#theId')
    expect(s2.title).toBe('aTitle2')
    expect(s2.description).toBe('aDescription2')
    expect(s2.elementSelector).toBe('#theId')
})