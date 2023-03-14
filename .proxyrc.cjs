module.exports = function (app) {

    app.use(
        function (req, res, next) {
            if (req.url === '/studio') {
                // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
                // res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
            }
            next()
        }
    )
}
