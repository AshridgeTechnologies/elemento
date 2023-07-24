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

// src/serverRuntime/index.ts --bundle --sourcemap --format=cjs  --minify --platform=node --target=node18.16 --outfile=dist/serverRuntime/serverRuntime.cjs

const ctx = await esbuild.context(devClientConfig)

await ctx.watch()

let { host, port } = await ctx.serve({
    servedir: outdir,
})

console.log('Server running on port', port)