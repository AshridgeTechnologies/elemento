IMAGE_TAG=${1:-latest}
IMAGE_URL=docker.io/ashridgetech/elemento-app-server:$IMAGE_TAG
SERVICE=elemento-app-server
REGION=europe-west2
echo Deploying service $SERVICE in region $REGION from image $IMAGE_URL
gcloud run deploy $SERVICE --project elemento-apps --image $IMAGE_URL --region $REGION --allow-unauthenticated --set-env-vars=SERVICES_AVAILABLE=install
