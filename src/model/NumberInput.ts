import Element from './Element'
import {PropertyType, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'
import MoneyOutlined from '@mui/icons-material/MoneyOutlined'

export type Properties = {
    readonly initialValue?: PropertyValueType<number>,
    readonly label?: PropertyValueType<string>
}
export default class NumberInput extends BaseInputElement<Properties> implements Element {

    static kind = 'NumberInput'
    static get iconClass() { return MoneyOutlined }
    get valueType(): PropertyType { return 'number' }
}