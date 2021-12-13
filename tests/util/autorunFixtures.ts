import Step from '../../src/model/autorun/Step'

export function editorAutorunFixture1() {
    return [
        new Step('Introduction', 'We are going to see how things work'),
        new Step('Navigation panel', 'This shows where you are', '#navigationPanel'),
        new Step('Properties panel', 'This shows the details', '#propertyPanel'),
    ]
}