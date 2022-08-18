releaseName=$1
scriptDir=`dirname $0`
yarn run cleanBuild
yarn run build
yarn run buildRuntime
$scriptDir/funcTestInEmulator.sh
$scriptDir/deployPreview.sh $releaseName
git tag -f $releaseName
