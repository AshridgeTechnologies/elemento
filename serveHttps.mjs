import * as esbuild from 'esbuild'
import {clientConfig} from './build.mjs'

const outdir = 'devDist'

const devClientConfig = {...clientConfig,
    sourcemap: true,
    minify: false,
    outdir,
    define: {
        "process.env.NODE_ENV": `"development"`,
        "process.env.NODE_DEBUG": `""`,
    }
}

const ctx = await esbuild.context(devClientConfig)

await ctx.watch()

let { host, port } = await ctx.serve({
    port: 8443,
    keyfile: './private/esbuild.key',
    certfile: './private/esbuild.cert',
    servedir: outdir,
})

console.log('Server running on port', port)