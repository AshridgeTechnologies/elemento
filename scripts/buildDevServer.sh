set -e

yarn run buildDevServerModule
yarn run buildDevServerRunner

yarn run pkg --no-bytecode --public --targets node18-macos-x64,node18-win-x64,node18-linux-x64 --out-path dist/devServer dist/devServer/runDevServer.cjs
mkdir -p dist/devServer/win && mv dist/devServer/runDevServer-win.exe dist/devServer/win/ElementoDevServer.exe
mkdir -p dist/devServer/linux && mv dist/devServer/runDevServer-linux dist/devServer/linux/ElementoDevServer
mkdir -p dist/devServer/macos && mv dist/devServer/runDevServer-macos dist/devServer/macos/ElementoDevServer
(cd dist/devServer/macos && rm -f  ElementoDevServer.zip && zip ElementoDevServer.zip ElementoDevServer)


