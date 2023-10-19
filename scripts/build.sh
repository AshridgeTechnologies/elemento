set -e

scriptDir=$(dirname $0)

yarn run cleanBuild
yarn run build



