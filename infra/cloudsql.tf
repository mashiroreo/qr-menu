resource "random_password" "dbpass" {
  length  = 16
  special = true
}

resource "google_sql_database_instance" "qrmenu" {
  name             = "qrmenu-db"
  database_version = "POSTGRES_16"
  region           = "asia-northeast1"

  settings {
    tier = "db-perf-optimized-N-2" # Enterprise Plus 対応の最小プリセット (2vCPU)

    ip_configuration {
      ipv4_enabled = true # 初期は Public IP、後で Private に変更予定
    }

    availability_type = "ZONAL"

    backup_configuration {
      enabled = true
    }
  }
}

resource "google_sql_database" "app" {
  name     = "app"
  instance = google_sql_database_instance.qrmenu.name
}

resource "google_sql_user" "appuser" {
  name     = "appuser"
  password = random_password.dbpass.result
  instance = google_sql_database_instance.qrmenu.name
}

# Secret Manager に接続文字列を保存
resource "google_secret_manager_secret" "database_url" {
  secret_id = "DATABASE_URL"
  replication {
    user_managed {
      replicas {
        location = "asia-northeast1"
      }
    }
  }
}

resource "google_secret_manager_secret_version" "database_url_v1" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${google_sql_user.appuser.name}:${random_password.dbpass.result}@${google_sql_database_instance.qrmenu.ip_address[0].ip_address}:5432/${google_sql_database.app.name}"
} 