import {ensureSlash} from './runtimeFunctions'

export default class AppUtils {
    constructor(private resourceUrl: string | undefined ) {}

    private get prefix() {
        return this.resourceUrl ? this.resourceUrl.replace(/\/$/, '') : ''
    }
    getFullUrl(url: string | undefined) {
        if (!url) return url
        if (url.match(/^https?:\/\//)) return url
        return this.prefix + ensureSlash(url)
    }

}