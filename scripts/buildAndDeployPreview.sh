set -e

releaseName=$1
scriptDir=`dirname $0`

$scriptDir/build.sh
# $scriptDir/funcTestInEmulator.sh
$scriptDir/deployPreview.sh $releaseName
git tag -f $releaseName
