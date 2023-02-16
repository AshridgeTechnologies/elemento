class HeaderMiddleware {
    middleware (config) {
        return async (ctx, next) => {
            const path = ctx.request.path
            console.log(path)
            if (path === '/studio') {
                ctx.response.set({
                    'Cross-Origin-Embedder-Policy': 'require-corp',
                    'Cross-Origin-Opener-Policy': 'same-origin'
                })
            }
            await next()
        }
    }
}

export default HeaderMiddleware