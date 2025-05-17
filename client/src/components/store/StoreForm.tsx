import { useState, useEffect } from 'react';
import { Store, StoreFormData, BusinessHours, SpecialBusinessDay, BusinessHourPeriod } from '../../types/store';
import { getStoreInfo, updateStore } from '../../api/store';
import { BusinessHoursInput } from './BusinessHoursInput';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';

export const StoreForm = () => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [businessHoursError, setBusinessHoursError] = useState<string | null>(null);
  const [specialBusinessDays, setSpecialBusinessDays] = useState<SpecialBusinessDay[]>([]);
  const [specialBusinessDaysError, setSpecialBusinessDaysError] = useState<string | null>(null);

  useEffect(() => {
    loadStoreInfo();
  }, []);

  useEffect(() => {
    if (store && Array.isArray(store.specialBusinessDays)) {
      setSpecialBusinessDays(store.specialBusinessDays);
    }
  }, [store]);

  useEffect(() => {
    const hasError = businessHours.some(
      (hours) =>
        Array.isArray(hours.periods) && hours.periods.some(
          (period) =>
            period.isOpen && (!period.openTime || !period.closeTime)
        )
    );
    if (hasError) {
      setBusinessHoursError('営業時間を設定する場合は、開始時刻・終了時刻の両方を入力してください。');
    } else {
      setBusinessHoursError(null);
    }
  }, [businessHours]);

  // 日付バリデーション関数
  const validateSpecialBusinessDay = (date: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate >= today;
  };

  useEffect(() => {
    const hasInvalidDate = specialBusinessDays.some(day => !validateSpecialBusinessDay(day.date));
    if (hasInvalidDate) {
      setSpecialBusinessDaysError('特別営業日は今日以降の日付を指定してください');
    } else {
      setSpecialBusinessDaysError(null);
    }
  }, [specialBusinessDays]);

  const loadStoreInfo = async () => {
    try {
      const data = await getStoreInfo();
      setStore(data);
      if (data.businessHours) {
        setBusinessHours(data.businessHours);
      }
      setError(null);
    } catch (err) {
      setError('店舗情報の取得に失敗しました');
      console.error('Error loading store info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setPhoneError(null);

    const formData = new FormData(e.currentTarget);
    const data: StoreFormData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      businessHours: businessHours,
      specialBusinessDays: specialBusinessDays,
      logoUrl: store?.logoUrl || null,
    };

    if (!/^\d+$/.test(data.phone)) {
      setPhoneError('電話番号は数字のみで入力してください');
      return;
    }

    try {
      const updatedStore = await updateStore(data);
      setStore(updatedStore);
      setSuccessMessage('店舗情報を更新しました');
    } catch (err) {
      setError('店舗情報の更新に失敗しました');
      console.error('Error updating store info:', err);
    }
  };

  const handleAddSpecialDay = () => {
    setSpecialBusinessDays([
      ...specialBusinessDays,
      {
        date: '',
        periods: [{ isOpen: true, openTime: '09:00', closeTime: '18:00' }],
      },
    ]);
  };

  const handleRemoveSpecialDay = (idx: number) => {
    setSpecialBusinessDays(specialBusinessDays.filter((_, i) => i !== idx));
  };

  const handleSpecialDayChange = (idx: number, field: keyof SpecialBusinessDay, value: any) => {
    const newDays = [...specialBusinessDays];
    newDays[idx] = { ...newDays[idx], [field]: value };
    setSpecialBusinessDays(newDays);
  };

  const handleSpecialPeriodChange = (dayIdx: number, periodIdx: number, field: keyof BusinessHourPeriod, value: any) => {
    const newDays = [...specialBusinessDays];
    newDays[dayIdx].periods = newDays[dayIdx].periods.map((p, i) =>
      i === periodIdx ? { ...p, [field]: value } : p
    );
    setSpecialBusinessDays(newDays);
  };

  const handleAddSpecialPeriod = (dayIdx: number) => {
    const newDays = [...specialBusinessDays];
    newDays[dayIdx].periods = [
      ...newDays[dayIdx].periods,
      { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    ];
    setSpecialBusinessDays(newDays);
  };

  const handleRemoveSpecialPeriod = (dayIdx: number, periodIdx: number) => {
    const newDays = [...specialBusinessDays];
    newDays[dayIdx].periods = newDays[dayIdx].periods.filter((_, i) => i !== periodIdx);
    setSpecialBusinessDays(newDays);
  };

  // 日付順でソート
  const sortedSpecialBusinessDays = [...specialBusinessDays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (loading) {
    return <div className="text-center">読み込み中...</div>;
  }

  return (
    <div className="p-4">
      <Typography variant="h4" component="h2" sx={{ mb: 4 }}>店舗情報</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}

      {phoneError && (
        <Alert severity="error" sx={{ mb: 2 }}>{phoneError}</Alert>
      )}

      {businessHoursError && (
        <Alert severity="error" sx={{ mb: 2 }}>{businessHoursError}</Alert>
      )}

      {specialBusinessDaysError && (
        <Alert severity="error" sx={{ mb: 2 }}>{specialBusinessDaysError}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            店舗名 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={store?.name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            店舗説明
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={store?.description}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            住所
          </label>
          <input
            type="text"
            id="address"
            name="address"
            defaultValue={store?.address}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            電話番号
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={store?.phone}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <BusinessHoursInput value={businessHours} onChange={setBusinessHours} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>臨時休業日・特別営業日</Typography>
          {sortedSpecialBusinessDays.map((day, idx) => (
            <div key={idx} className="mb-4 p-2 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="date"
                  value={day.date}
                  onChange={e => handleSpecialDayChange(idx, 'date', e.target.value)}
                  className="border rounded px-2 py-1"
                  required
                  style={{ borderColor: !validateSpecialBusinessDay(day.date) ? 'red' : undefined }}
                />
                <Button color="error" size="small" variant="outlined" onClick={() => handleRemoveSpecialDay(idx)} sx={{ ml: 1 }}>削除</Button>
                {!validateSpecialBusinessDay(day.date) && (
                  <span style={{ color: 'red', marginLeft: 8 }}>今日以降の日付を指定してください</span>
                )}
              </div>
              {day.periods.map((period, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={period.isOpen}
                        onChange={() => handleSpecialPeriodChange(idx, pIdx, 'isOpen', true)}
                        name={`special-day-${idx}-${pIdx}`}
                      />
                      営業
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={!period.isOpen}
                        onChange={() => handleSpecialPeriodChange(idx, pIdx, 'isOpen', false)}
                        name={`special-day-${idx}-${pIdx}`}
                      />
                      休業
                    </label>
                  </div>
                  {period.isOpen ? (
                    <>
                      <input
                        type="time"
                        value={period.openTime}
                        onChange={e => handleSpecialPeriodChange(idx, pIdx, 'openTime', e.target.value)}
                        className="border rounded px-1"
                        required={period.isOpen}
                      />
                      <span>〜</span>
                      <input
                        type="time"
                        value={period.closeTime}
                        onChange={e => handleSpecialPeriodChange(idx, pIdx, 'closeTime', e.target.value)}
                        className="border rounded px-1"
                        required={period.isOpen}
                      />
                    </>
                  ) : (
                    <span className="text-gray-500 ml-2">休業</span>
                  )}
                  {day.periods.length > 1 && (
                    <Button color="error" size="small" variant="outlined" onClick={() => handleRemoveSpecialPeriod(idx, pIdx)} sx={{ ml: 1 }}>枠削除</Button>
                  )}
                </div>
              ))}
              <Button size="small" variant="outlined" color="primary" onClick={() => handleAddSpecialPeriod(idx)} sx={{ mt: 1 }} startIcon={<span>＋</span>}>時間帯追加</Button>
            </div>
          ))}
          <Button color="primary" variant="outlined" onClick={handleAddSpecialDay} startIcon={<span>＋</span>}>特別営業日追加</Button>
        </Box>

        <Box sx={{ pt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !!businessHoursError || !!specialBusinessDaysError}
          >
            保存
          </Button>
        </Box>
      </form>
    </div>
  );
}; 