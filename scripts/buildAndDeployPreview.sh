releaseName=$1
scriptDir=`dirname $0`
yarn run cleanBuild
yarn run build
$scriptDir/funcTestInEmulator.sh
$scriptDir/deployPreview.sh $releaseName
git tag -f $releaseName
