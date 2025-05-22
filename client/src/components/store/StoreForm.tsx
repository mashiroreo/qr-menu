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
  FormLabel,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { EditIconButton } from '../common/EditIconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
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
  const [isHolidayClosed, setIsHolidayClosed] = useState<boolean>(store?.isHolidayClosed ?? false);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
  });

  // 営業時間編集モード
  const [isEditingBusinessHours, setIsEditingBusinessHours] = useState(false);
  const [tempBusinessHours, setTempBusinessHours] = useState<BusinessHours[]>([]);

  // 特別営業日編集モード
  const [isEditingSpecialDays, setIsEditingSpecialDays] = useState(false);
  const [tempSpecialBusinessDays, setTempSpecialBusinessDays] = useState<SpecialBusinessDay[]>([]);

  // 祝日営業編集モード
  const [isEditingHoliday, setIsEditingHoliday] = useState(false);
  const [tempIsHolidayClosed, setTempIsHolidayClosed] = useState(isHolidayClosed);

  // 営業時間 曜日ごと編集用 state
  const [editDayOfWeek, setEditDayOfWeek] = useState<string | null>(null);
  const [tempDayBusinessHours, setTempDayBusinessHours] = useState<BusinessHourPeriod[]>([]);

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

  useEffect(() => {
    if (store && typeof store.isHolidayClosed === 'boolean') {
      setIsHolidayClosed(store.isHolidayClosed);
    }
  }, [store]);

  useEffect(() => {
    if (store) {
      setEditValues({
        name: store.name || '',
        description: store.description || '',
        address: store.address || '',
        phone: store.phone || '',
      });
    }
  }, [store]);

  useEffect(() => {
    if (store && Array.isArray(store.businessHours)) {
      setTempBusinessHours(store.businessHours);
    }
  }, [store]);

  useEffect(() => {
    if (store && Array.isArray(store.specialBusinessDays)) {
      setTempSpecialBusinessDays(store.specialBusinessDays);
    }
  }, [store]);

  useEffect(() => {
    setTempIsHolidayClosed(isHolidayClosed);
  }, [isHolidayClosed]);

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

  const handleFieldSave = async (field: string) => {
    if (!store) return;
    setError(null);
    setSuccessMessage(null);
    setPhoneError(null);
    if (field === 'phone' && !/^\d+$/.test(editValues.phone)) {
      setPhoneError('電話番号は数字のみで入力してください');
      return;
    }
    const data: StoreFormData = {
      ...store,
      name: editValues.name,
      description: editValues.description,
      address: editValues.address,
      phone: editValues.phone,
      businessHours: businessHours,
      specialBusinessDays: specialBusinessDays,
      logoUrl: store.logoUrl || null,
      isHolidayClosed: isHolidayClosed,
    };
    try {
      const updatedStore = await updateStore(data);
      setStore(updatedStore);
      setSuccessMessage('店舗情報を更新しました');
      setEditField(null);
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
    if (!window.confirm('本当にこの特別営業日を削除しますか？')) return;
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
    const periods = newDays[dayIdx].periods;
    let newOpen = '09:00';
    let newClose = '18:00';
    if (periods.length > 0) {
      const last = periods[periods.length - 1];
      newOpen = last.closeTime;
      // デフォルト終了時刻は+1時間（24:00超えは00:00に）
      const [h, m] = last.closeTime.split(':').map(Number);
      let endH = h + 1;
      if (endH >= 24) endH = 0;
      newClose = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    newDays[dayIdx].periods = [
      ...periods,
      { isOpen: true, openTime: newOpen, closeTime: newClose },
    ];
    setSpecialBusinessDays(newDays);
  };

  const handleRemoveSpecialPeriod = (dayIdx: number, periodIdx: number) => {
    if (!window.confirm('本当にこの時間帯を削除しますか？')) return;
    const newDays = [...specialBusinessDays];
    newDays[dayIdx].periods = newDays[dayIdx].periods.filter((_, i) => i !== periodIdx);
    setSpecialBusinessDays(newDays);
  };

  // --- 追加: 時間帯重複チェック関数 ---
  const checkPeriodOverlap = (periods: BusinessHourPeriod[], currentIdx: number): boolean => {
    const current = periods[currentIdx];
    if (!current.isOpen) return false;
    const [cOpenH, cOpenM] = current.openTime.split(':').map(Number);
    const [cCloseH, cCloseM] = current.closeTime.split(':').map(Number);
    const cOpen = cOpenH * 60 + cOpenM;
    const cClose = cCloseH * 60 + cCloseM;
    return periods.some((p, idx) => {
      if (idx === currentIdx || !p.isOpen) return false;
      const [pOpenH, pOpenM] = p.openTime.split(':').map(Number);
      const [pCloseH, pCloseM] = p.closeTime.split(':').map(Number);
      const pOpen = pOpenH * 60 + pOpenM;
      const pClose = pCloseH * 60 + pCloseM;
      // 深夜営業対応
      const isCurrentOvernight = cOpen > cClose;
      const isPOtherOvernight = pOpen > pClose;
      if (isCurrentOvernight && isPOtherOvernight) {
        return true;
      } else if (isCurrentOvernight) {
        return (pOpen <= cClose || pOpen >= cOpen) || (pClose <= cClose || pClose >= cOpen);
      } else if (isPOtherOvernight) {
        return (cOpen <= pClose || cOpen >= pOpen) || (cClose <= pClose || cClose >= pOpen);
      } else {
        return (cOpen < pClose && cClose > pOpen);
      }
    });
  };

  // --- 追加: 日付重複チェック関数 ---
  const isDuplicateDate = (date: string, idx: number) =>
    specialBusinessDays.filter((d, i) => d.date === date && i !== idx).length > 0;

  // 営業時間編集モード
  const handleBusinessHoursEdit = () => {
    setTempBusinessHours(businessHours);
    setIsEditingBusinessHours(true);
  };
  const handleBusinessHoursCancel = () => {
    setTempBusinessHours(businessHours);
    setIsEditingBusinessHours(false);
  };
  const handleBusinessHoursSave = async () => {
    if (!store) return;
    setError(null);
    setSuccessMessage(null);
    const data: StoreFormData = {
      ...store,
      name: editValues.name,
      description: editValues.description,
      address: editValues.address,
      phone: editValues.phone,
      businessHours: tempBusinessHours,
      specialBusinessDays: specialBusinessDays,
      logoUrl: store.logoUrl || null,
      isHolidayClosed: isHolidayClosed,
    };
    try {
      const updatedStore = await updateStore(data);
      setStore(updatedStore);
      setBusinessHours(tempBusinessHours);
      setSuccessMessage('営業時間を更新しました');
      setIsEditingBusinessHours(false);
    } catch (err) {
      setError('営業時間の更新に失敗しました');
      console.error('Error updating business hours:', err);
    }
  };

  // 特別営業日編集モード
  const handleSpecialDaysEdit = () => {
    setTempSpecialBusinessDays(specialBusinessDays);
    setIsEditingSpecialDays(true);
  };
  const handleSpecialDaysCancel = () => {
    setTempSpecialBusinessDays(specialBusinessDays);
    setIsEditingSpecialDays(false);
  };
  const handleSpecialDaysSave = async () => {
    if (!store) return;
    setError(null);
    setSuccessMessage(null);
    const data: StoreFormData = {
      ...store,
      name: editValues.name,
      description: editValues.description,
      address: editValues.address,
      phone: editValues.phone,
      businessHours: businessHours,
      specialBusinessDays: tempSpecialBusinessDays,
      logoUrl: store.logoUrl || null,
      isHolidayClosed: isHolidayClosed,
    };
    try {
      const updatedStore = await updateStore(data);
      setStore(updatedStore);
      setSpecialBusinessDays(tempSpecialBusinessDays);
      setSuccessMessage('特別営業日を更新しました');
      setIsEditingSpecialDays(false);
    } catch (err) {
      setError('特別営業日の更新に失敗しました');
      console.error('Error updating special business days:', err);
    }
  };

  // 祝日営業編集モード
  const handleHolidayEdit = () => {
    setTempIsHolidayClosed(isHolidayClosed);
    setIsEditingHoliday(true);
  };
  const handleHolidayCancel = () => {
    setTempIsHolidayClosed(isHolidayClosed);
    setIsEditingHoliday(false);
  };
  const handleHolidaySave = async () => {
    if (!store) return;
    setError(null);
    setSuccessMessage(null);
    const data: StoreFormData = {
      ...store,
      name: editValues.name,
      description: editValues.description,
      address: editValues.address,
      phone: editValues.phone,
      businessHours: businessHours,
      specialBusinessDays: specialBusinessDays,
      logoUrl: store.logoUrl || null,
      isHolidayClosed: tempIsHolidayClosed,
    };
    try {
      const updatedStore = await updateStore(data);
      setStore(updatedStore);
      setIsHolidayClosed(tempIsHolidayClosed);
      setSuccessMessage('祝日の営業情報を更新しました');
      setIsEditingHoliday(false);
    } catch (err) {
      setError('祝日の営業情報の更新に失敗しました');
      console.error('Error updating holiday info:', err);
    }
  };

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

      <Box sx={{ pl: { xs: 0, sm: 2, md: 4 }, pr: 2, mb: 4, maxWidth: 700 }}>
        {/* 店舗名 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">店舗名</Typography>
            {editField === 'name' ? (
              <TextField
                value={editValues.name}
                onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                size="small"
                autoFocus
                sx={{ mt: 0.5, width: '100%' }}
              />
            ) : (
              <Typography sx={{ mt: 0.5 }}>{store?.name || '-'}</Typography>
            )}
          </Box>
          {editField === 'name' ? (
            <>
              <IconButton color="primary" onClick={() => handleFieldSave('name')} sx={{ alignSelf: 'flex-start' }}><CheckIcon /></IconButton>
              <IconButton onClick={() => { setEditField(null); setEditValues(v => ({ ...v, name: store?.name || '' })); }} sx={{ alignSelf: 'flex-start' }}><CloseIcon /></IconButton>
            </>
          ) : (
            <EditIconButton onClick={() => setEditField('name')} />
          )}
        </Box>
        {/* 店舗説明 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">店舗説明</Typography>
            {editField === 'description' ? (
              <TextField
                value={editValues.description}
                onChange={e => setEditValues(v => ({ ...v, description: e.target.value }))}
                size="small"
                multiline
                minRows={2}
                sx={{ mt: 0.5, width: '100%' }}
              />
            ) : (
              <Typography sx={{ mt: 0.5 }}>{store?.description || '-'}</Typography>
            )}
          </Box>
          {editField === 'description' ? (
            <>
              <IconButton color="primary" onClick={() => handleFieldSave('description')} sx={{ alignSelf: 'flex-start' }}><CheckIcon /></IconButton>
              <IconButton onClick={() => { setEditField(null); setEditValues(v => ({ ...v, description: store?.description || '' })); }} sx={{ alignSelf: 'flex-start' }}><CloseIcon /></IconButton>
            </>
          ) : (
            <EditIconButton onClick={() => setEditField('description')} />
          )}
        </Box>
        {/* 住所 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">住所</Typography>
            {editField === 'address' ? (
              <TextField
                value={editValues.address}
                onChange={e => setEditValues(v => ({ ...v, address: e.target.value }))}
                size="small"
                sx={{ mt: 0.5, width: '100%' }}
              />
            ) : (
              <Typography sx={{ mt: 0.5 }}>{store?.address || '-'}</Typography>
            )}
          </Box>
          {editField === 'address' ? (
            <>
              <IconButton color="primary" onClick={() => handleFieldSave('address')} sx={{ alignSelf: 'flex-start' }}><CheckIcon /></IconButton>
              <IconButton onClick={() => { setEditField(null); setEditValues(v => ({ ...v, address: store?.address || '' })); }} sx={{ alignSelf: 'flex-start' }}><CloseIcon /></IconButton>
            </>
          ) : (
            <EditIconButton onClick={() => setEditField('address')} />
          )}
        </Box>
        {/* 電話番号 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">電話番号</Typography>
            {editField === 'phone' ? (
              <TextField
                value={editValues.phone}
                onChange={e => setEditValues(v => ({ ...v, phone: e.target.value }))}
                size="small"
                sx={{ mt: 0.5, width: '100%' }}
              />
            ) : (
              <Typography sx={{ mt: 0.5 }}>{store?.phone || '-'}</Typography>
            )}
          </Box>
          {editField === 'phone' ? (
            <>
              <IconButton color="primary" onClick={() => handleFieldSave('phone')} sx={{ alignSelf: 'flex-start' }}><CheckIcon /></IconButton>
              <IconButton onClick={() => { setEditField(null); setEditValues(v => ({ ...v, phone: store?.phone || '' })); }} sx={{ alignSelf: 'flex-start' }}><CloseIcon /></IconButton>
            </>
          ) : (
            <EditIconButton onClick={() => setEditField('phone')} />
          )}
        </Box>
      </Box>

      {/* 祝日の営業 表示＋編集切り替え */}
      <Box sx={{ pl: { xs: 0, sm: 2, md: 4 }, pr: 2, mb: 4, maxWidth: 700 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">祝日の営業</Typography>
            {isEditingHoliday ? (
              <RadioGroup
                row
                value={tempIsHolidayClosed ? 'closed' : 'open'}
                onChange={e => setTempIsHolidayClosed(e.target.value === 'closed')}
              >
                <FormControlLabel value="open" control={<Radio />} label="祝日も営業" />
                <FormControlLabel value="closed" control={<Radio />} label="祝日は休業" />
              </RadioGroup>
            ) : (
              <Typography sx={{ mt: 0.5 }}>
                {isHolidayClosed ? '祝日は休業' : '祝日も営業'}
              </Typography>
            )}
          </Box>
          {isEditingHoliday ? (
            <>
              <IconButton color="primary" onClick={handleHolidaySave} sx={{ alignSelf: 'flex-start' }}><CheckIcon /></IconButton>
              <IconButton onClick={handleHolidayCancel} sx={{ alignSelf: 'flex-start' }}><CloseIcon /></IconButton>
            </>
          ) : (
            <EditIconButton onClick={handleHolidayEdit} />
          )}
        </Box>
      </Box>

      {/* 営業時間 曜日ごと編集UI */}
      <Box sx={{ pl: { xs: 0, sm: 2, md: 4 }, pr: 2, mb: 4, maxWidth: 700 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">営業時間</Typography>
            <Box sx={{ mt: 1 }}>
              {Array.isArray(businessHours) && businessHours.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {businessHours.map((hours, idx) => {
                    const dayLabel = (() => {
                      switch (hours.dayOfWeek) {
                        case 'monday': return '月曜日';
                        case 'tuesday': return '火曜日';
                        case 'wednesday': return '水曜日';
                        case 'thursday': return '木曜日';
                        case 'friday': return '金曜日';
                        case 'saturday': return '土曜日';
                        case 'sunday': return '日曜日';
                        default: return hours.dayOfWeek;
                      }
                    })();
                    // 編集中かどうか
                    const isEditing = editDayOfWeek === hours.dayOfWeek;
                    return (
                      <li key={hours.dayOfWeek + '-' + idx} style={{ marginBottom: 4 }}>
                        {isEditing ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {/* 編集UI: 時間帯input＋追加・削除 */}
                            {tempDayBusinessHours.map((period, pIdx) => (
                              <Box key={pIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TextField
                                  type="time"
                                  value={period.openTime}
                                  onChange={e => {
                                    const newPeriods = [...tempDayBusinessHours];
                                    newPeriods[pIdx].openTime = e.target.value;
                                    setTempDayBusinessHours(newPeriods);
                                  }}
                                  size="small"
                                  required={period.isOpen}
                                  sx={{ minWidth: isMobile ? 60 : 120 }}
                                />
                                <Typography>〜</Typography>
                                <TextField
                                  type="time"
                                  value={period.closeTime}
                                  onChange={e => {
                                    const newPeriods = [...tempDayBusinessHours];
                                    newPeriods[pIdx].closeTime = e.target.value;
                                    setTempDayBusinessHours(newPeriods);
                                  }}
                                  size="small"
                                  required={period.isOpen}
                                  sx={{ minWidth: isMobile ? 60 : 120 }}
                                />
                                {tempDayBusinessHours.length > 1 && (
                                  <Button
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      const newPeriods = tempDayBusinessHours.filter((_, i) => i !== pIdx);
                                      setTempDayBusinessHours(newPeriods);
                                    }}
                                    sx={{ minWidth: isMobile ? 28 : 60, ml: 1 }}
                                    variant="outlined"
                                  >
                                    {isMobile ? <DeleteIcon fontSize="small" /> : '削除'}
                                  </Button>
                                )}
                              </Box>
                            ))}
                            <Button
                              size="small"
                              onClick={() => {
                                const periods = tempDayBusinessHours;
                                let newOpen = '09:00';
                                let newClose = '18:00';
                                if (periods.length > 0) {
                                  const last = periods[periods.length - 1];
                                  newOpen = last.closeTime;
                                  const [h, m] = last.closeTime.split(':').map(Number);
                                  let endH = h + 1;
                                  if (endH >= 24) endH = 0;
                                  newClose = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                }
                                setTempDayBusinessHours([
                                  ...periods,
                                  { isOpen: true, openTime: newOpen, closeTime: newClose },
                                ]);
                              }}
                              sx={{ mt: 1 }}
                              startIcon={<span>＋</span>}
                              variant="outlined"
                              color="primary"
                            >
                              時間帯追加
                            </Button>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <IconButton color="primary" onClick={async () => {
                                // 保存処理
                                const newBusinessHours = businessHours.map(bh =>
                                  bh.dayOfWeek === hours.dayOfWeek
                                    ? { ...bh, periods: tempDayBusinessHours }
                                    : bh
                                );
                                setBusinessHours(newBusinessHours);
                                setEditDayOfWeek(null);
                                // API保存
                                if (store) {
                                  setError(null);
                                  setSuccessMessage(null);
                                  try {
                                    const data: StoreFormData = {
                                      ...store,
                                      name: editValues.name,
                                      description: editValues.description,
                                      address: editValues.address,
                                      phone: editValues.phone,
                                      businessHours: newBusinessHours,
                                      specialBusinessDays: specialBusinessDays,
                                      logoUrl: store.logoUrl || null,
                                      isHolidayClosed: isHolidayClosed,
                                    };
                                    const updatedStore = await updateStore(data);
                                    setStore(updatedStore);
                                    setSuccessMessage('営業時間を更新しました');
                                  } catch (err) {
                                    setError('営業時間の更新に失敗しました');
                                    console.error('Error updating business hours:', err);
                                  }
                                }
                              }} sx={{ alignSelf: 'flex-start' }}><CheckIcon /></IconButton>
                              <IconButton onClick={() => {
                                setEditDayOfWeek(null);
                                setTempDayBusinessHours([]);
                              }} sx={{ alignSelf: 'flex-start' }}><CloseIcon /></IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {Array.isArray(hours.periods) && hours.periods.length > 0 ? (
                              hours.periods.map((period, pIdx) => (
                                <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                  <span style={{ fontWeight: 500, minWidth: 60, display: 'inline-block', visibility: pIdx === 0 ? 'visible' : 'hidden' }}>
                                    {pIdx === 0 ? dayLabel : '　'}
                                  </span>
                                  <span>
                                    {pIdx === 0 ? '：' : '　'}
                                    {period.isOpen ? `${period.openTime}〜${period.closeTime}` : '休業'}
                                    {pIdx < hours.periods.length - 1 && <span> ／ </span>}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ fontWeight: 500, minWidth: 60, display: 'inline-block' }}>{dayLabel}</span>：休業
                              </div>
                            )}
                            <EditIconButton onClick={() => {
                              setEditDayOfWeek(hours.dayOfWeek);
                              setTempDayBusinessHours(hours.periods.map(p => ({ ...p })));
                            }} />
                          </Box>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Typography sx={{ color: 'text.secondary' }}>未設定</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 特別営業日 表示＋編集切り替え */}
      <Box sx={{ pl: { xs: 0, sm: 2, md: 4 }, pr: 2, mb: 4, maxWidth: 700 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">臨時休業日・特別営業日</Typography>
            {isEditingSpecialDays ? (
              // 従来の特別営業日入力UIをそのまま利用
              <Box sx={{ mt: 1 }}>
                {/* ここに従来の特別営業日入力UIを移動 */}
                {/* --- ここから --- */}
                {specialBusinessDaysError && (
                  <Alert severity="error" sx={{ mb: 2 }}>{specialBusinessDaysError}</Alert>
                )}
                {tempSpecialBusinessDays.map((day, idx) => {
                  const isOpenDay = day.periods.some(p => p.isOpen);
                  return (
                    <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                        <TextField
                          type="date"
                          value={day.date}
                          onChange={e => {
                            const newDays = [...tempSpecialBusinessDays];
                            newDays[idx] = { ...newDays[idx], date: e.target.value };
                            setTempSpecialBusinessDays(newDays);
                          }}
                          error={!validateSpecialBusinessDay(day.date) || isDuplicateDate(day.date, idx)}
                          helperText={
                            !validateSpecialBusinessDay(day.date)
                              ? '今日以降の日付を指定してください'
                              : isDuplicateDate(day.date, idx)
                                ? 'この日付はすでに登録済みです'
                                : ''
                          }
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
                              const newDays = [...tempSpecialBusinessDays];
                              if (open) {
                                if (!isOpenDay) {
                                  newDays[idx].periods = [{ isOpen: true, openTime: '09:00', closeTime: '18:00' }];
                                } else {
                                  newDays[idx].periods = newDays[idx].periods.map(p => ({ ...p, isOpen: true }));
                                }
                              } else {
                                newDays[idx].periods = newDays[idx].periods.map(p => ({ ...p, isOpen: false }));
                              }
                              setTempSpecialBusinessDays(newDays);
                            }}
                            sx={{ gap: 0.25 }}
                          >
                            <FormControlLabel value="open" control={<Radio size="small" />} label={isMobile ? "営" : "営業"} sx={{ mr: 0.25 }} />
                            <FormControlLabel value="closed" control={<Radio size="small" />} label={isMobile ? "休" : "休業"} sx={{ mr: 0.25 }} />
                          </RadioGroup>
                        </FormControl>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            const newDays = tempSpecialBusinessDays.filter((_, i) => i !== idx);
                            setTempSpecialBusinessDays(newDays);
                          }}
                          sx={{ minWidth: isMobile ? 28 : 60, ml: 0.5 }}
                          variant="outlined"
                        >
                          {isMobile ? <DeleteIcon fontSize="small" /> : '削除'}
                        </Button>
                      </Box>
                      {isOpenDay ? (
                        <>
                          {day.periods.map((period, pIdx) => {
                            if (!period.isOpen) return null;
                            return (
                              <Box key={pIdx} sx={{ display: 'flex', gap: 1, mb: 1, minHeight: 48, flexWrap: 'nowrap', width: '100%', maxWidth: '100%', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  <FormControl size="small" sx={{ minWidth: isMobile ? 60 : 120, flexShrink: 1 }}>
                                    <TextField
                                      type="time"
                                      value={period.openTime}
                                      onChange={e => {
                                        const newDays = [...tempSpecialBusinessDays];
                                        newDays[idx].periods[pIdx].openTime = e.target.value;
                                        setTempSpecialBusinessDays(newDays);
                                      }}
                                      size="small"
                                      required={period.isOpen}
                                    />
                                  </FormControl>
                                  <Typography>〜</Typography>
                                  <FormControl size="small" sx={{ minWidth: isMobile ? 60 : 120, flexShrink: 1 }}>
                                    <TextField
                                      type="time"
                                      value={period.closeTime}
                                      onChange={e => {
                                        const newDays = [...tempSpecialBusinessDays];
                                        newDays[idx].periods[pIdx].closeTime = e.target.value;
                                        setTempSpecialBusinessDays(newDays);
                                      }}
                                      size="small"
                                      required={period.isOpen}
                                    />
                                  </FormControl>
                                  {day.periods.length > 1 && (
                                    <Button
                                      size="small"
                                      color="error"
                                      onClick={() => {
                                        const newDays = [...tempSpecialBusinessDays];
                                        newDays[idx].periods = newDays[idx].periods.filter((_, i) => i !== pIdx);
                                        setTempSpecialBusinessDays(newDays);
                                      }}
                                      sx={{ minWidth: isMobile ? 28 : 60, ml: 1, alignSelf: 'center', py: 1 }}
                                      variant="outlined"
                                    >
                                      {isMobile ? <DeleteIcon fontSize="small" /> : '削除'}
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                            );
                          })}
                          <Button
                            size="small"
                            onClick={() => {
                              const newDays = [...tempSpecialBusinessDays];
                              const periods = newDays[idx].periods;
                              let newOpen = '09:00';
                              let newClose = '18:00';
                              if (periods.length > 0) {
                                const last = periods[periods.length - 1];
                                newOpen = last.closeTime;
                                const [h, m] = last.closeTime.split(':').map(Number);
                                let endH = h + 1;
                                if (endH >= 24) endH = 0;
                                newClose = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                              }
                              newDays[idx].periods = [
                                ...periods,
                                { isOpen: true, openTime: newOpen, closeTime: newClose },
                              ];
                              setTempSpecialBusinessDays(newDays);
                            }}
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
                    </Box>
                  );
                })}
                <Button color="primary" variant="outlined" onClick={() => {
                  setTempSpecialBusinessDays([
                    ...tempSpecialBusinessDays,
                    {
                      date: '',
                      periods: [{ isOpen: true, openTime: '09:00', closeTime: '18:00' }],
                    },
                  ]);
                }} startIcon={<span>＋</span>}>特別営業日追加</Button>
                {/* --- ここまで --- */}
              </Box>
            ) : (
              <Box sx={{ mt: 1 }}>
                {Array.isArray(specialBusinessDays) && specialBusinessDays.length > 0 ? (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {specialBusinessDays.map((day, idx) => (
                      <li key={day.date + '-' + idx} style={{ marginBottom: 8 }}>
                        {Array.isArray(day.periods) && day.periods.length > 0 ? (
                          day.periods.map((period, pIdx) => (
                            <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 500, minWidth: 80, display: 'inline-block', visibility: pIdx === 0 ? 'visible' : 'hidden' }}>
                                {pIdx === 0 ? day.date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, '$2/$3') : '　'}
                              </span>
                              <span>
                                {pIdx === 0 ? '：' : '　'}
                                {period.isOpen ? `${period.openTime}〜${period.closeTime}` : '休業'}
                                {pIdx < day.periods.length - 1 && <span> ／ </span>}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: 500, minWidth: 80, display: 'inline-block' }}>{day.date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, '$2/$3')}</span>：休業
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography sx={{ color: 'text.secondary' }}>未設定</Typography>
                )}
              </Box>
            )}
          </Box>
          {isEditingSpecialDays ? (
            <>
              <IconButton color="primary" onClick={handleSpecialDaysSave} sx={{ alignSelf: 'flex-start' }}><CheckIcon /></IconButton>
              <IconButton onClick={handleSpecialDaysCancel} sx={{ alignSelf: 'flex-start' }}><CloseIcon /></IconButton>
            </>
          ) : (
            <EditIconButton onClick={handleSpecialDaysEdit} />
          )}
        </Box>
      </Box>
    </div>
  );
}; 