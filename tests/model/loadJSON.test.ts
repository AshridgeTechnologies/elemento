import Text from '../../src/model/Text'
import Page from '../../src/model/Page'
import TextInput from '../../src/model/TextInput'
import App from '../../src/model/App'
import {loadJSONFromString} from '../../src/model/loadJSON'
import {ex} from '../testutil/testHelpers'

// tests for loadJSON are in the test for each model class

test('converts single element from JSON string', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const textInput4 = new TextInput('t4', 'Text 4', {initialValue: ex`"Some text"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, textInput4])

    const app = new App('a1', 'App 1', {author: ex`Jo`}, [page1, page2])
    const newApp = loadJSONFromString(JSON.stringify(app))
    expect(newApp).toStrictEqual<App>(app)
})

test('converts array of elements from JSON string', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const elements = [text1, page1, text3]
    const newElements = loadJSONFromString(JSON.stringify(elements))
    expect(newElements).toStrictEqual(elements)
})
