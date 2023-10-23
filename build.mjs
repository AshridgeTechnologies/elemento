import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill'
import { lessLoader } from 'esbuild-plugin-less'
import { copy } from 'esbuild-plugin-copy'
import * as esbuild from 'esbuild'

const outdir = 'dist'

export const clientConfig = {
    entryPoints: [
        { in: 'src/runtime/index.ts', out: 'lib/runtime'},
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

export const serverConfig = {
    entryPoints: [
        { in: 'src/serverRuntime/index.ts', out: 'lib/serverRuntime'},
    ],
    outExtension: { '.js': '.cjs' },
    bundle: true,
    sourcemap: false,
    format: 'cjs',
    minify: true,
    platform: 'node',
    target: 'node18.16',
    outdir,
    plugins: [],
    define: {
        "process.env.NODE_ENV": `"production"`,
        "process.env.NODE_DEBUG": `""`,
    }
}

const output = await Promise.all([
    esbuild.build(clientConfig),
    esbuild.build(serverConfig),
    ])

console.log(output)