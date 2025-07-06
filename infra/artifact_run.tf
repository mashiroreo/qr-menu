resource "google_artifact_registry_repository" "qrmenu" {
  provider      = google-beta
  location      = "asia-northeast1"
  repository_id = "qrmenu"
  format        = "DOCKER"
}

resource "google_cloud_run_service" "api" {
  name     = "qrmenu-api"
  location = "asia-northeast1"

  template {
    spec {
      service_account_name = "qrmenu-run-sa@${var.project_id}.iam.gserviceaccount.com"

      containers {
        image = "asia-northeast1-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.qrmenu.repository_id}/qrmenu-api:latest"

        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.database_url.secret_id
              key  = "latest"
            }
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

resource "google_cloud_run_service_iam_member" "public_invoker" {
  service  = google_cloud_run_service.api.name
  location = google_cloud_run_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
} 