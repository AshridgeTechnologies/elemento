set -e

mkdir -p devDist
[ -d dist/runtime ] && cp -R dist/runtime/ devDist/runtime
[ -d dist/serverRuntime ] && cp -R dist/serverRuntime/ devDist/serverRuntime
[ -d dist/devServer ] && cp -R dist/devServer/ devDist/devServer
echo 'Synced dist to devDist'

