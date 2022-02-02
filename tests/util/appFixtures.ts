import App from '../../src/model/App'
import Page from '../../src/model/Page'
import Text from '../../src/model/Text'
import TextInput from '../../src/model/TextInput'

export function appFixture1() {

    return new App('app1', 'App One', {}, [
        new Page('page1', 'Main Page', {}, [
            new Text('text_1', 'First Text', {content: '"The first bit of text"'}),
            new Text('text_2', 'Second Text', {content: '"The second bit of text"'}),
        ]),
        new Page('page2', 'Other Page', {}, [
            new Text('text_3', 'Some Text', {content: '"Some text here"'}),
            new Text('text_4', 'More Text', {content: '"...and more text"'}),
        ])
    ])
}

export function appFixture2() {

    return new App('app1', 'App One', {}, [
        new Page('page1', 'Main Page', {}, [
            new Text('text_1', 'First Text', {content: '"The first bit of text"'}),
            new TextInput('textInput_1', 'First Text Input', {initialValue: '"A text value"', maxLength: "30"}),
        ]),
        new Page('page2', 'Other Page', {}, [
            new Text('text_3', 'Some Text', {content: '"Some text here"'}),
            new TextInput('textInput_2', 'Another Text Input', {initialValue: '"Type the text"', maxLength: "50"}),
        ])
    ])
}
