resource "google_cloudbuild_trigger" "qrmenu_main" {
  provider    = google-beta
  name        = "qrmenu-main-trigger"
  description = "Trigger Cloud Build on push to main branch"
  location    = "asia-northeast1"

  github {
    owner = "mashiroreo"
    name  = "qr-menu"
    push {
      branch = "main"
    }
  }

  filename = "cloudbuild.yaml"

  substitutions = {
    _REGION = "asia-northeast1"
  }

  service_account = "projects/${var.project_id}/serviceAccounts/cloudbuild-trigger-sa@${var.project_id}.iam.gserviceaccount.com"

  build {
    options {
      logging = "CLOUD_LOGGING_ONLY"
    }
  }

  # Service account executing builds (Cloud Build default SA)
  included_files = [ "**" ]
} 