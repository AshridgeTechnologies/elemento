set -e

releaseName=$1
scriptDir=`dirname $0`
yarn run cleanBuild
yarn run build
yarn run buildRuntime
yarn run buildServerRuntime
$scriptDir/funcTestInEmulator.sh
$scriptDir/deployPreview.sh $releaseName
git tag -f $releaseName
