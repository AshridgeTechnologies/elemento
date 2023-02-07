import * as esbuild from 'esbuild'

// see https://bajtos.net/posts/2022-05-bundling-nodejs-for-aws-lambda/#nodejs-esm-target
const REQUIRE_SHIM = `
// Shim require if needed.
import module from 'module';
if (typeof globalThis.require === "undefined") {
  globalThis.require = module.createRequire(import.meta.url);
}
`;

const config = {
    entryPoints: ['src/generator/index.ts'],
    bundle: true,
    sourcemap: true,
    format: 'esm',
    platform: 'node',
    target: 'node16.17',
    outfile: 'dist/tools/tools.js',
    banner: {
        js: REQUIRE_SHIM,
    },
};

const output = await esbuild.build(config)

console.log(output)