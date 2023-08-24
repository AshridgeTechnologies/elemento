import {callParent} from './controllerHelpers'

export default class PreviewControllerClient {
    public SetOptions = callParent('Preview.SetOptions')
    public Show = callParent('Preview.Show')
    public Click = callParent('Preview.Click')
    public SetValue = callParent('Preview.SetValue')
    public GetValue = callParent('Preview.GetValue')
    public GetState = callParent('Preview.GetState')
    public GetTextContent = callParent('Preview.GetTextContent')
}

export const Preview = new PreviewControllerClient()