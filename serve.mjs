import * as esbuild from 'esbuild'
import {clientConfig, serverConfig} from './build.mjs'

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

const devServerConfig = {...serverConfig,
    sourcemap: true,
    minify: false,
    outdir,
    define: {
        "process.env.NODE_ENV": `"development"`,
        "process.env.NODE_DEBUG": `""`,
    }
}

const clientCtx = await esbuild.context(devClientConfig)
await clientCtx.watch()

const serverCtx = await esbuild.context(devServerConfig)
await serverCtx.watch()

let { host, port } = await clientCtx.serve({
    servedir: outdir,
    fallback: `${outdir}/run/index.html`,  // to let the Run app from GitHub link work
    cors: {
        origin: 'http://localhost:8787',
    }})

console.log('Server running on port', port)
