// From https://thymikee.github.io/jest-preset-angular/docs/guides/troubleshooting/#resolver-needed-for-some-javascript-library-or-nested-dependencies

module.exports = (path, options) => {
    // Call the defaultResolver, so we leverage its cache, error handling, etc.
    if (path.includes('@openauth')) {
        console.log(path)
        console.log(options)
        return `${options.moduleDirectory[0]}/@openauthjs/openauth/dist/esm/client.js`
    }
    return options.defaultResolver(path, {
        ...options,
        // Use packageFilter to process parsed `package.json` before the resolution (see https://www.npmjs.com/package/resolve#resolveid-opts-cb)
        packageFilter: (pkg) => {
            const pkgNamesToTarget = new Set([
                '@firebase/auth',
                '@firebase/storage',
                '@firebase/functions',
                '@firebase/database',
                '@firebase/auth-compat',
                '@firebase/database-compat',
                '@firebase/app-compat',
                '@firebase/firestore',
                '@firebase/firestore-compat',
                '@firebase/messaging',
                '@firebase/util',
                'firebase',
                'dexie',
            ]);

            if (pkgNamesToTarget.has(pkg.name)) {
                // console.log('>>>', pkg.name)
                delete pkg['exports'];
                delete pkg['module'];
            }

            return pkg;
        },
        // pathFilter: (pkg, path, relativePath) => {
        //     if (path.includes('@openauth')) {
        //         console.log(path)
        //     }
        //     return path
        // }
    });
};
