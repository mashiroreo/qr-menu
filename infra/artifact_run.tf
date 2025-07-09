resource "google_artifact_registry_repository" "qrmenu" {
  provider      = google-beta
  location      = "asia-northeast1"
  repository_id = "qrmenu"
  format        = "DOCKER"
} 