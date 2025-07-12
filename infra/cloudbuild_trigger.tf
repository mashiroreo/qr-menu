resource "google_cloudbuild_trigger" "qrmenu_main" {
  provider    = google-beta
  name        = "qrmenu-main-trigger"
  description = "Trigger Cloud Build on push to main branch"
  location    = "asia-northeast1"

  service_account = "projects/${var.project_id}/serviceAccounts/cloudbuild-trigger-sa@${var.project_id}.iam.gserviceaccount.com"

  github {
    owner = "mashiroreo"
    name  = "qr-menu"
    push {
      branch = "main"
    }
  }

  # filename = "cloudbuild.yaml"   # インライン build に置き換え

  build {
    step {
      id   = "Build"
      name = "gcr.io/cloud-builders/docker"
      args = ["build", "-t", "$_IMAGE", "-f", "server/Dockerfile", "."]
    }

    step {
      id   = "Push"
      name = "gcr.io/cloud-builders/docker"
      args = ["push", "$_IMAGE"]
    }

    step {
      id         = "Deploy"
      name       = "gcr.io/google.com/cloudsdktool/cloud-sdk"
      entrypoint = "gcloud"
      args = [
        "run", "deploy", "qrmenu-api",
        "--image=$_IMAGE",
        "--region=$_REGION",
        "--platform=managed",
        "--service-account=qrmenu-run-sa@$${PROJECT_ID}.iam.gserviceaccount.com",
        "--update-secrets=DATABASE_URL=projects/$${PROJECT_NUMBER}/secrets/DATABASE_URL:latest",
        "--add-cloudsql-instances=qrmenu-db",
        "--quiet",
      ]
    }

    images = ["$_IMAGE"]

    substitutions = {
      _IMAGE  = "asia-northeast1-docker.pkg.dev/${var.project_id}/qrmenu/qrmenu-api:$${SHORT_SHA}"
      _REGION = "asia-northeast1"
    }

    options {
      logging = "CLOUD_LOGGING_ONLY"
    }
  }

  # Service account executing builds (Cloud Build default SA)
  included_files = [ "**" ]
} 