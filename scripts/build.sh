set -e

scriptDir=$(dirname $0)

yarn run cleanBuild
yarn run build
yarn run buildRuntime
yarn run buildServerRuntime
"$scriptDir"/buildDevServer.sh



