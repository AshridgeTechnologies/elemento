import {callRpc, observeRpc} from './rpcHelpers'
import {ElementId} from '../model/Types'

export default class PreviewControllerClient {
    constructor(public win: Window) {
    }

    private isReady = callRpc('Preview.IsReady', this.win, 100)
    private serverStatus = callRpc('Preview.ServerStatus', this.win)
    private highlight = callRpc('Preview.Highlight', this.win)
    private callFunction = callRpc('Preview.CallFunction', this.win)
    private show = callRpc('Preview.Show', this.win)
    private click = callRpc('Preview.Click', this.win)
    private setValue = callRpc('Preview.SetValue', this.win)
    private getValue = callRpc('Preview.GetValue', this.win)
    private getState = callRpc('Preview.GetState', this.win)
    private getTextContent = callRpc('Preview.GetTextContent', this.win)
    private debug = observeRpc('Preview.Debug', undefined, this.win)
    private url = observeRpc('Preview.Url', undefined, this.win)
    private elementSelected = observeRpc('Preview.ElementSelected', undefined, this.win)
    private getUrl = callRpc('Preview.GetUrl', this.win)
    private setUrl = callRpc('Preview.SetUrl', this.win)
    private back = callRpc('Preview.Back', this.win)
    private forward = callRpc('Preview.Forward', this.win)
    private reload = callRpc('Preview.Reload', this.win)

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

    Debug(debugExpr: string) {
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
