import {callRpc, observeRpc} from './rpcHelpers'
import {ElementId} from '../model/Types'

export default class PreviewControllerClient {
    constructor(public win: Window) {
        this.isReady = callRpc('Preview.IsReady', this.win, 100)
        this.serverStatus = callRpc('Preview.ServerStatus', this.win)
        this.highlight = callRpc('Preview.Highlight', this.win)
        this.callFunction = callRpc('Preview.CallFunction', this.win)
        this.show = callRpc('Preview.Show', this.win)
        this.click = callRpc('Preview.Click', this.win)
        this.setValue = callRpc('Preview.SetValue', this.win)
        this.getValue = callRpc('Preview.GetValue', this.win)
        this.getState = callRpc('Preview.GetState', this.win)
        this.getTextContent = callRpc('Preview.GetTextContent', this.win)
        this.debug = observeRpc('Preview.Debug', undefined, this.win)
        this.url = observeRpc('Preview.Url', undefined, this.win)
        this.elementSelected = observeRpc('Preview.ElementSelected', undefined, this.win)
        this.getUrl = callRpc('Preview.GetUrl', this.win)
        this.setUrl = callRpc('Preview.SetUrl', this.win)
        this.back = callRpc('Preview.Back', this.win)
        this.forward = callRpc('Preview.Forward', this.win)
        this.reload = callRpc('Preview.Reload', this.win)
    }

    private readonly isReady
    private readonly serverStatus
    private readonly highlight
    private readonly callFunction
    private readonly show
    private readonly click
    private readonly setValue
    private readonly getValue
    private readonly getState
    private readonly getTextContent
    private readonly debug
    private readonly url
    private readonly elementSelected
    private readonly getUrl
    private readonly setUrl
    private readonly back
    private readonly forward
    private readonly reload

    IsReady() {
        return this.isReady()
    }

    ServerStatus() {
        return this.serverStatus()
    }

    Highlight(elementIds: ElementId[]) {
        return this.highlight(elementIds)
    }

    CallFunction(componentId: string, functionName: string, args: any[] = []) {
        return this.callFunction(componentId, functionName, args)
    }

    Show(selector?: string) {
        return this.show(selector)
    }

    Click(selector: string) {
        return this.click(selector)
    }

    SetValue(selector: string, value: string | boolean) {
        return this.setValue(selector, value)
    }

    GetValue(selector: string) {
        return this.getValue(selector)
    }

    GetState(selector: string) {
        return this.getState(selector)
    }

    GetTextContent(selector: string) {
        return this.getTextContent(selector)
    }

    Debug(debugExpr: string | null) {
        return this.debug(debugExpr)
    }

    Url() {
        return this.url()
    }

    ElementSelected() {
        return this.elementSelected()
    }

    GetUrl() {
        return this.getUrl()
    }

    SetUrl(url: string) {
        return this.setUrl(url)
    }

    Back() {
        return this.back()
    }

    Forward() {
        return this.forward()
    }

    Reload() {
        return this.reload()
    }
}

export const Preview = new PreviewControllerClient(window.parent)
