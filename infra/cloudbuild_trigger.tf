resource "google_cloudbuild_trigger" "qrmenu_main" {
  provider    = google-beta
  name        = "qrmenu-main-trigger"
  description = "Trigger Cloud Build on push to main branch"

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

  # Service account executing builds (Cloud Build default SA)
  included_files = [ "**" ]
} 