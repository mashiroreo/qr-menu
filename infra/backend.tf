terraform {
  backend "gcs" {
    bucket = "qrmenu-tf-state-qrmenu-34cc1"
    prefix = "terraform/state"
  }
} 