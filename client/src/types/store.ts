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

export type SpecialBusinessDay = {
  date: string; // 'YYYY-MM-DD'
  periods: BusinessHourPeriod[]; // 営業時間（複数可）
  note?: string; // 任意メモ
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
  isHolidayClosed?: boolean; // 祝日は休業するか（デフォルト: 営業）
  specialBusinessDays?: SpecialBusinessDay[];
};

export type StoreFormData = Omit<Store, 'id' | 'createdAt' | 'updatedAt'>; 