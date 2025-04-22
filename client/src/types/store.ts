export interface Store {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  businessHours?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreFormData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  businessHours?: string;
}

export interface StoreLogoData {
  logoUrl: string;
} 