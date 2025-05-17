export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type BusinessHourPeriod = {
  isOpen: boolean;
  openTime: string; // "HH:mm"形式
  closeTime: string; // "HH:mm"形式
};

export type BusinessHours = {
  dayOfWeek: DayOfWeek;
  periods: BusinessHourPeriod[];
};

export type Store = {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  businessHours: BusinessHours[];
  createdAt: string;
  updatedAt: string;
  address: string;
  phone: string;
};

export type StoreFormData = Omit<Store, 'id' | 'createdAt' | 'updatedAt'>; 