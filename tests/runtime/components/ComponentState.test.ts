import {expect, test, vi} from "vitest"
/**
 * @vitest-environment jsdom
 */
import {wait} from '../../testutil/testHelpers'
import {appFunctions, globalFunctions, stateProps, wrapFn} from '../../../src/runtime'
import {DataState} from '../../../src/runtime/components/Data'
import {BaseComponentState, Block, Calculation, Data, TextInput} from '../../../src/runtime/components'
import {TextInputState} from '../../../src/runtime/components/TextInput'
import AppStateStore from '../../../src/runtime/AppStateStore'
import SubscribableStore from '../../../src/runtime/SubscribableStore'

const {Log, Left} = globalFunctions
const {Set} = appFunctions

class NameInput_State extends BaseComponentState<any> {
    childNames = ['Block1', 'FirstName', 'SecondName', 'FullName', 'NameData']

    createChildStates() {
        const pathTo = (name: string) => this._path + '.' + name
        const {First, Second, SaveAction} = this.props
        const {SetNames, GetNameAndInitial, SetNameData} = this
        const Block1 = this.getOrCreateChildState('Block1', new Block.State(stateProps(pathTo('Block1')).props))
        const FirstName = this.getOrCreateChildState('FirstName', new TextInput.State(stateProps(pathTo('FirstName')).value(First).props))
        const SecondName = this.getOrCreateChildState('SecondName', new TextInput.State(stateProps(pathTo('SecondName')).value(Second).props))
        const FullName = this.getOrCreateChildState('FullName', new Calculation.State(stateProps(pathTo('FullName')).value(FirstName + ' ' + SecondName).props))
        const NameData = this.getOrCreateChildState('NameData', new Data.State(stateProps(pathTo('NameData')).props))
        return {Block1, FirstName, SecondName, FullName, NameData}
    }

    get Block1() { return this.childStates.Block1 }
    get FirstName() { return this.childStates.FirstName as TextInputState }
    get SecondName() { return this.childStates.SecondName as TextInputState }
    get FullName() { return this.childStates.FullName }
    get NameData() { return this.childStates.NameData as DataState }

    SetNames = wrapFn('NameInput.SetNames', 'calculation', async (firstName, secondName) => {
        const {SetNameData} = this
        await SetNameData(secondName + ', ' + firstName)
    })
    SetNameData = wrapFn('NameInput.SetNameData', 'calculation', (newName) => {
        const {NameData} = this
        const {Initials} = this
        Set(NameData, newName)
        Log('Set Name Data', newName, Initials)
    })
    GetNameAndInitial = wrapFn('NameInput.GetNameAndInitial', 'calculation', () => {
        const {SecondName, FirstName} = this
        return SecondName + ', ' + Left(FirstName, 1)
    })

    Save_action = wrapFn('NameInput.Save', 'action', async () => {
        const {FirstName, SecondName} = this
        const {SaveAction} = this.props
        const {SetNames} = this
        await SaveAction()
        await SetNames(FirstName, SecondName)
    })
    get DisplayName() {
        const {FirstName, SecondName, FullName} = this
        return FirstName + ' ' +  SecondName + ' - aka ' + FullName
    }
    get Initials() {
        const {FirstName, SecondName} = this
        return Left(FirstName, 1)  +   Left(SecondName, 1)
    }
    get NamePlusInitial() {
        const {GetNameAndInitial} = this
        return GetNameAndInitial()
    }
}

test('State class has correct properties and functions', async () => {
    const store = new AppStateStore(new SubscribableStore())
    const saveAction = vi.fn()
    const state = new NameInput_State({SaveAction: saveAction, First: 'Andy', Second: 'Brown' })
    store.set('nameInput1', state)
    await wait()
    expect(state.Initials).toStrictEqual('AB')
    await state.latest().SetNames('Marti', 'Parti')
    expect(state.latest().NameData.value).toBe('Parti, Marti')

    store.set('nameInput1.FirstName', new TextInputState({})._withStateForTest({value: 'Genna'}))
    store.set('nameInput1.SecondName', new TextInputState({})._withStateForTest({value: 'Venna'}))
    await wait()
    expect(state.latest().Initials).toStrictEqual('GV')
})

test('State class updates from an object with new props', () => {
    const saveAction = vi.fn()
    const state1 = new NameInput_State({SaveAction: saveAction, First: 'Andy', Second: 'Brown' })
    const state2 = new NameInput_State({SaveAction: saveAction, First: 'Andy', Second: 'Brown' })
    const state3 = new NameInput_State({SaveAction: saveAction, First: 'Andy', Second: 'Black' })

    const store = new AppStateStore(new SubscribableStore())
    store.set('nameInput1', state1)


    expect(state1.updateFrom(state2)).toBe(state1)
    expect(state1.updateFrom(state3).props.Second).toBe('Black')
})
