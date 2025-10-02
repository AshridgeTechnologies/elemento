/**
 * @vitest-environment jsdom
 */
import {expect, test, vi} from 'vitest'
import {wait} from '../../testutil/testHelpers'
import {DataState} from '../../../src/runtime/components/Data'
import {TextInputState} from '../../../src/runtime/components/TextInput'
import {CalculationState} from '../../../src/runtime/components/Calculation'
import {BaseComponentState, ComponentStateStore} from '../../../src/runtime/state/BaseComponentState'

const Left = (s: {value: string | null} | undefined, n: number): string => s?.value?.slice(0, n) ?? ''

class NameInput_State extends BaseComponentState<any> {

    SetNames(firstName: string, secondName: string) {
        const {SetNameData} = this
        SetNameData(secondName + ', ' + firstName)
    }
    SetNameData(newName: string) {
        const {NameData} = (this as any)
        const {Initials} = this
        NameData.Set(newName)
        console.log('Set Name Data', newName, Initials)
    }
    get Initials() {
        const {FirstName, SecondName} = (this as any)
        return Left(FirstName, 1)  +   Left(SecondName, 1)
    }
}

test('State class can use child elements', async () => {
    const store = new ComponentStateStore()
    const saveAction = vi.fn()
    const state: any = store.getOrUpdate('nameInput1', NameInput_State, {SaveAction: saveAction, First: 'Andy', Second: 'Brown' })
    store.getOrUpdate('nameInput1.FirstName', TextInputState, {initialValue: 'Andy'})
    store.getOrUpdate('nameInput1.SecondName', TextInputState, {initialValue: 'Brown'})
    store.getOrUpdate('nameInput1.FullName', CalculationState, {calculation: state.FirstName + ' ' + state.SecondName})
    store.getOrUpdate('nameInput1.NameData', DataState, {initialValue: undefined})
    await wait(10)
    expect(state.Initials).toStrictEqual('AB')
    await state.SetNames('Marti', 'Parti')
    expect(state.NameData.value).toBe('Parti, Marti')

    store.update('nameInput1.FirstName', new TextInputState({}).withState({value: 'Genna'}))
    store.update('nameInput1.SecondName', new TextInputState({}).withState({value: 'Venna'}))
    await wait()
    expect(state.Initials).toStrictEqual('GV')
})

