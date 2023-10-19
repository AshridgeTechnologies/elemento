import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill'
import { lessLoader } from 'esbuild-plugin-less'
import { copy } from 'esbuild-plugin-copy'
import * as esbuild from 'esbuild'

const outdir = 'dist'

export const clientConfig = {
    entryPoints: [
        { in: 'src/runtime/index.ts', out: 'runtime/runtime'},
        // { in: 'src/serverRuntime/index.ts', out: 'runtime/serverRuntime'},
        { in: 'src/editor/runEditor.ts', out: 'studio/runEditor'},
        { in: 'src/editor/runLocalApp.ts', out: 'run/runLocalApp'},
        { in: 'src/appswebsite/sw.ts', out: 'sw' },
        { in: 'src/appswebsite/runnerSw.ts', out: 'runnerSw' },
        { in: 'src/appswebsite/index.ts', out: 'index' },
    ],
    bundle: true,
    sourcemap: false,
    format: 'esm',
    minify: true,
    outdir,
    plugins: [
        lessLoader(),
        nodeModulesPolyfillPlugin({modules: ['os', 'path', 'crypto', 'buffer'], globals: {Buffer: true} }),
        copy({
            assets: {
                from: ['src/appswebsite/**/index.html' ],
                to: ['.'],
            },
        })
    ],
    define: {
        "process.env.NODE_ENV": `"production"`,
        "process.env.NODE_DEBUG": `""`,
    }
}

// src/serverRuntime/index.ts --bundle --sourcemap --format=cjs  --minify --platform=node --target=node18.16 --outfile=dist/serverRuntime/serverRuntime.cjs

const output = await esbuild.build(clientConfig)

console.log(output)