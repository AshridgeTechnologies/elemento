Server side apps Part 2
=======================

Aims
----

- Developers can build and deploy server side apps more easily

Requirements
------------

- Preview can use simulated server running in browser
- Documentation includes all prerequisites inc manual steps like enabling API in Cloud Console
- Google approval for Elemento to remove security warnings
- Server functions can run within the client app
- Server app can provide an external API with configurable paths

Setup to enable API
-------------------

Enable Cloud Run Admin API

Cloud Functions uses Artifact Registry to store function docker images. Artifact Registry API is not enabled in your project. To enable the API, 
visit https://console.cloud.google.com/marketplace/product/google/artifactregistry.googleapis.com or use the gcloud command 'gcloud services enable artifactregistry.googleapis.com'.

Could not build the function due to missing permissions. Cloud Build API has not been used in project 266192601073 before or it is disabled. 
Enable it by visiting https://console.developers.google.com/apis/api/cloudbuild.googleapis.com/overview?project=266192601073 then retry. 
If you enabled this API recently, wait a few minutes for the action to propagate to our systems and retry.
