import {callParent, observeParent} from './controllerHelpers'

export default class PreviewControllerClient {
    public SetOptions = callParent('Preview.SetOptions')
    public Show = callParent('Preview.Show')
    public Click = callParent('Preview.Click')
    public SetValue = callParent('Preview.SetValue')
    public GetValue = callParent('Preview.GetValue')
    public GetState = callParent('Preview.GetState')
    public GetTextContent = callParent('Preview.GetTextContent')
    public Debug = observeParent('Preview.Debug')
    public Url = observeParent('Preview.Url')
    public SetUrl = callParent('Preview.SetUrl')
    public Back = callParent('Preview.Back')
    public Forward = callParent('Preview.Forward')
    public Reload = callParent('Preview.Reload')
}

export const Preview = new PreviewControllerClient()
