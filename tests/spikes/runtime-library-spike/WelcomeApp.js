import * as Elemento from "http://localhost:8000/runtime/index.js"
const {React} = Elemento

// MainPage.js
function MainPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement} = Elemento.components

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('FirstText'), fontSize: 32}, "Welcome to Elemento!"),
        React.createElement(TextElement, {path: pathWith('SecondText'), color: 'green'}, "The future of low code programming"),
        React.createElement(TextElement, {path: pathWith('ThirdText')}, "Start your program here..."),
    )
}

// appMain.js
export default function WelcometoElemento(props) {
    const pathWith = name => 'WelcometoElemento' + '.' + name
    const {App} = Elemento.components
    const pages = {MainPage}
    const app = Elemento.useObjectState('app', new App.State({pages}))

    return React.createElement(App, {path: 'WelcometoElemento', },)
}

