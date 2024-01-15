CHANNEL_ID=$1
SOURCE_SITE_ID=elemento-apps
TARGET_SITE_ID=elemento-apps
yarn run firebase hosting:clone ${SOURCE_SITE_ID}:${CHANNEL_ID} ${TARGET_SITE_ID}:live
