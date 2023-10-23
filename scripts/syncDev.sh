set -e

mkdir -p devDist
[ -d dist/lib ] && cp -R dist/lib/ devDist/lib
[ -d dist/devServer ] && cp -R dist/devServer/ devDist/devServer
echo 'Synced dist to devDist'

