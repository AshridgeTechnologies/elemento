const fs = require('fs')
module.exports = function (app) {
    const fs = require('fs')

    app.use(
        function (req, res, next) {
            console.log(req.url)
            if (req.url.startsWith('/run/')) {
                const runHtml = fs.readFileSync('devDist/run/index.html', 'utf8')
                res.end(runHtml)
                return
            }
            next()
        }
    )
}
