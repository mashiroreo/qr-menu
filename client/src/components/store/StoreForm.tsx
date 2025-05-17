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
  FormControl,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          {sortedSpecialBusinessDays.map((day, idx) => {
            // その日のperiodsがすべてisOpen: falseなら臨時休業
            const isOpenDay = day.periods.some(p => p.isOpen);
            return (
              <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                  <TextField
                    type="date"
                    value={day.date}
                    onChange={e => handleSpecialDayChange(idx, 'date', e.target.value)}
                    error={!validateSpecialBusinessDay(day.date)}
                    helperText={!validateSpecialBusinessDay(day.date) ? '今日以降の日付を指定してください' : ''}
                    required
                    size="small"
                    sx={{ width: isMobile ? 150 : 190 }}
                  />
                  <FormControl component="fieldset" size="small" sx={{ ml: 0.5 }}>
                    <RadioGroup
                      row
                      value={isOpenDay ? 'open' : 'closed'}
                      onChange={e => {
                        const open = e.target.value === 'open';
                        const newDays = [...specialBusinessDays];
                        if (open) {
                          if (!isOpenDay) {
                            newDays[idx].periods = [{ isOpen: true, openTime: '09:00', closeTime: '18:00' }];
                          } else {
                            newDays[idx].periods = newDays[idx].periods.map(p => ({ ...p, isOpen: true }));
                          }
                        } else {
                          newDays[idx].periods = newDays[idx].periods.map(p => ({ ...p, isOpen: false }));
                        }
                        setSpecialBusinessDays(newDays);
                      }}
                      sx={{ gap: 0.25 }}
                    >
                      <FormControlLabel value="open" control={<Radio size="small" />} label={isMobile ? "営" : "営業"} sx={{ mr: 0.25 }} />
                      <FormControlLabel value="closed" control={<Radio size="small" />} label={isMobile ? "休" : "休業"} sx={{ mr: 0.25 }} />
                    </RadioGroup>
                  </FormControl>
                  {!isOpenDay && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveSpecialDay(idx)}
                      sx={{ minWidth: isMobile ? 28 : 60, ml: 0.5 }}
                      variant="outlined"
                      aria-label="削除"
                    >
                      {isMobile ? <DeleteIcon fontSize="small" /> : '削除'}
                    </Button>
                  )}
                </Box>
                {isOpenDay ? (
                  <>
                    {day.periods.map((period, pIdx) => {
                      if (!period.isOpen) return null;
                      return (
                        <Box key={pIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, minHeight: 48, flexWrap: 'nowrap', width: '100%', maxWidth: '100%' }}>
                          <FormControl size="small" sx={{ minWidth: isMobile ? 60 : 120, flexShrink: 1 }}>
                            <TextField
                              type="time"
                              value={period.openTime}
                              onChange={e => handleSpecialPeriodChange(idx, pIdx, 'openTime', e.target.value)}
                              size="small"
                              required={period.isOpen}
                            />
                          </FormControl>
                          <Typography>〜</Typography>
                          <FormControl size="small" sx={{ minWidth: isMobile ? 60 : 120, flexShrink: 1 }}>
                            <TextField
                              type="time"
                              value={period.closeTime}
                              onChange={e => handleSpecialPeriodChange(idx, pIdx, 'closeTime', e.target.value)}
                              size="small"
                              required={period.isOpen}
                            />
                          </FormControl>
                          {day.periods.length > 1 && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemoveSpecialPeriod(idx, pIdx)}
                              sx={{ minWidth: isMobile ? 32 : 60, ml: 1, alignSelf: 'center', py: 1 }}
                              variant="outlined"
                              aria-label="枠削除"
                            >
                              {isMobile ? <DeleteIcon fontSize="small" /> : '削除'}
                            </Button>
                          )}
                        </Box>
                      );
                    })}
                    <Button
                      size="small"
                      onClick={() => handleAddSpecialPeriod(idx)}
                      sx={{ mt: 1 }}
                      startIcon={<span>＋</span>}
                      variant="outlined"
                      color="primary"
                    >
                      時間帯追加
                    </Button>
                  </>
                ) : (
                  <Typography sx={{ color: 'text.secondary', ml: 2 }}>休業</Typography>
                )}
                {isOpenDay && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveSpecialDay(idx)}
                    sx={{ minWidth: isMobile ? 32 : 60, ml: 1, mt: 1 }}
                    variant="outlined"
                    aria-label="削除"
                  >
                    {isMobile ? <DeleteIcon fontSize="small" /> : '削除'}
                  </Button>
                )}
              </Box>
            );
          })}
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