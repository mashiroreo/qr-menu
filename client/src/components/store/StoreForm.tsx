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
  Chip,
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

  // --- 追加: 特別営業日 日付ごと編集用 state ---
  const [editSpecialDayIndex, setEditSpecialDayIndex] = useState<number | null>(null);
  const [tempSpecialDayPeriods, setTempSpecialDayPeriods] = useState<BusinessHourPeriod[]>([]);
  const [tempSpecialDayDate, setTempSpecialDayDate] = useState<string>('');

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

  // 編集フラグ
  const isAnyEditing = editField !== null || editDayOfWeek !== null || editSpecialDayIndex !== null || isEditingHoliday;

  // 編集ボタン・追加ボタンのonClickをラップ
  const handleEditButton = (editAction: () => void) => {
    if (isAnyEditing) {
      window.alert('編集中の項目があります。入力を完了してください。');
      return;
    }
    editAction();
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

      <Box sx={{ pl: { xs: 0, sm: 2, md: 4 }, pr: 2, mb: 4, maxWidth: 700 }}>
        {/* 店舗名 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">店舗名</Typography>
            {editField === 'name' ? (
              <Box sx={{ backgroundColor: 'rgba(0, 0, 255, 0.05)', borderLeft: '4px solid #1976d2', pl: 1.5, py: 1, borderRadius: 1, mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label="編集中" size="small" color="primary" variant="outlined" />
                </Box>
                <TextField
                  value={editValues.name}
                  onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                  size="small"
                  autoFocus
                  sx={{ width: '100%' }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" size="small" onClick={() => handleFieldSave('name')}>保存</Button>
                  <Button variant="outlined" size="small" onClick={() => { setEditField(null); setEditValues(v => ({ ...v, name: store?.name || '' })); }}>キャンセル</Button>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ mt: 0.5 }}>{store?.name || '-'}</Typography>
            )}
          </Box>
          {editField !== 'name' && (
            <EditIconButton onClick={() => handleEditButton(() => setEditField('name'))} />
          )}
        </Box>
        {/* 店舗説明 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">店舗説明</Typography>
            {editField === 'description' ? (
              <Box sx={{ backgroundColor: 'rgba(0, 0, 255, 0.05)', borderLeft: '4px solid #1976d2', pl: 1.5, py: 1, borderRadius: 1, mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label="編集中" size="small" color="primary" variant="outlined" />
                </Box>
                <TextField
                  value={editValues.description}
                  onChange={e => setEditValues(v => ({ ...v, description: e.target.value }))}
                  size="small"
                  multiline
                  minRows={2}
                  sx={{ width: '100%' }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" size="small" onClick={() => handleFieldSave('description')}>保存</Button>
                  <Button variant="outlined" size="small" onClick={() => { setEditField(null); setEditValues(v => ({ ...v, description: store?.description || '' })); }}>キャンセル</Button>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ mt: 0.5 }}>{store?.description || '-'}</Typography>
            )}
          </Box>
          {editField !== 'description' && (
            <EditIconButton onClick={() => handleEditButton(() => setEditField('description'))} />
          )}
        </Box>
        {/* 住所 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">住所</Typography>
            {editField === 'address' ? (
              <Box sx={{ backgroundColor: 'rgba(0, 0, 255, 0.05)', borderLeft: '4px solid #1976d2', pl: 1.5, py: 1, borderRadius: 1, mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label="編集中" size="small" color="primary" variant="outlined" />
                </Box>
                <TextField
                  value={editValues.address}
                  onChange={e => setEditValues(v => ({ ...v, address: e.target.value }))}
                  size="small"
                  sx={{ width: '100%' }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" size="small" onClick={() => handleFieldSave('address')}>保存</Button>
                  <Button variant="outlined" size="small" onClick={() => { setEditField(null); setEditValues(v => ({ ...v, address: store?.address || '' })); }}>キャンセル</Button>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ mt: 0.5 }}>{store?.address || '-'}</Typography>
            )}
          </Box>
          {editField !== 'address' && (
            <EditIconButton onClick={() => handleEditButton(() => setEditField('address'))} />
          )}
        </Box>
        {/* 電話番号 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">電話番号</Typography>
            {editField === 'phone' ? (
              <Box sx={{ backgroundColor: 'rgba(0, 0, 255, 0.05)', borderLeft: '4px solid #1976d2', pl: 1.5, py: 1, borderRadius: 1, mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label="編集中" size="small" color="primary" variant="outlined" />
                </Box>
                <TextField
                  value={editValues.phone}
                  onChange={e => setEditValues(v => ({ ...v, phone: e.target.value }))}
                  size="small"
                  sx={{ width: '100%' }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" size="small" onClick={() => handleFieldSave('phone')}>保存</Button>
                  <Button variant="outlined" size="small" onClick={() => { setEditField(null); setEditValues(v => ({ ...v, phone: store?.phone || '' })); }}>キャンセル</Button>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ mt: 0.5 }}>{store?.phone || '-'}</Typography>
            )}
          </Box>
          {editField !== 'phone' && (
            <EditIconButton onClick={() => handleEditButton(() => setEditField('phone'))} />
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
              <IconButton color="primary" onClick={() => handleHolidaySave()}><CheckIcon /></IconButton>
              <IconButton onClick={() => handleHolidayCancel()}><CloseIcon /></IconButton>
            </>
          ) : (
            <EditIconButton onClick={() => handleEditButton(handleHolidayEdit)} />
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
                      <li 
                        key={hours.dayOfWeek + '-' + idx} 
                        style={{ 
                          marginBottom: 4, 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          justifyContent: 'space-between',
                          backgroundColor: editDayOfWeek === hours.dayOfWeek ? 'rgba(0, 0, 255, 0.05)' : 'transparent',
                          borderLeft: editDayOfWeek === hours.dayOfWeek ? '4px solid #1976d2' : 'none',
                          paddingLeft: editDayOfWeek === hours.dayOfWeek ? '8px' : '0',
                        }}
                      >
                        {isEditing ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span style={{ fontWeight: 500 }}>{dayLabel}</span>
                              <Chip 
                                label="編集中" 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <FormControl component="fieldset" size="small">
                                <RadioGroup
                                  row
                                  value={tempDayBusinessHours.some(p => p.isOpen) ? 'open' : 'closed'}
                                  onChange={(e) => {
                                    const isOpen = e.target.value === 'open';
                                    if (isOpen) {
                                      if (tempDayBusinessHours.length === 0) {
                                        setTempDayBusinessHours([{ isOpen: true, openTime: '09:00', closeTime: '17:00' }]);
                                      } else {
                                        setTempDayBusinessHours(tempDayBusinessHours.map(p => ({ ...p, isOpen: true })));
                                      }
                                    } else {
                                      setTempDayBusinessHours(tempDayBusinessHours.map(p => ({ ...p, isOpen: false })));
                                    }
                                  }}
                                >
                                  <FormControlLabel value="open" control={<Radio size="small" />} label="営業" />
                                  <FormControlLabel value="closed" control={<Radio size="small" />} label="休業" />
                                </RadioGroup>
                              </FormControl>
                              {tempDayBusinessHours.some(p => p.isOpen) && (
                                <>
                                  {tempDayBusinessHours.map((period, pIdx) => (
                                    <Box key={pIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <TextField
                                        type="time"
                                        value={period.openTime}
                                        onChange={(e) => {
                                          const newHours = [...tempDayBusinessHours];
                                          newHours[pIdx] = { ...newHours[pIdx], openTime: e.target.value };
                                          // 重複チェック
                                          if (checkPeriodOverlap(newHours, pIdx)) {
                                            setError('時間帯が重複しています');
                                            return;
                                          }
                                          setError(null); // エラーをクリア
                                          setTempDayBusinessHours(newHours);
                                        }}
                                        size="small"
                                        required
                                        sx={{ width: 120 }}
                                      />
                                      <span>〜</span>
                                      <TextField
                                        type="time"
                                        value={period.closeTime}
                                        onChange={(e) => {
                                          const newHours = [...tempDayBusinessHours];
                                          newHours[pIdx] = { ...newHours[pIdx], closeTime: e.target.value };
                                          // 重複チェック
                                          if (checkPeriodOverlap(newHours, pIdx)) {
                                            setError('時間帯が重複しています');
                                            return;
                                          }
                                          setError(null); // エラーをクリア
                                          setTempDayBusinessHours(newHours);
                                        }}
                                        size="small"
                                        required
                                        sx={{ width: 120 }}
                                      />
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          if (!window.confirm('この時間帯を削除しますか？')) return;
                                          setTempDayBusinessHours(tempDayBusinessHours.filter((_, i) => i !== pIdx));
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ))}
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<span>＋</span>}
                                    onClick={() => {
                                      const periods = tempDayBusinessHours;
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
                                      const newPeriod = { isOpen: true, openTime: newOpen, closeTime: newClose };
                                      // 重複チェック
                                      if (checkPeriodOverlap([...periods, newPeriod], periods.length)) {
                                        setError('時間帯が重複しています');
                                        return;
                                      }
                                      setTempDayBusinessHours([...periods, newPeriod]);
                                    }}
                                    sx={{ alignSelf: 'flex-start' }}
                                  >
                                    時間帯追加
                                  </Button>
                                </>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={async () => {
                                  const newHours = [...businessHours];
                                  const index = newHours.findIndex(h => h.dayOfWeek === editDayOfWeek);
                                  if (index !== -1) {
                                    newHours[index] = {
                                      ...newHours[index],
                                      periods: tempDayBusinessHours
                                    };
                                    setBusinessHours(newHours);
                                    
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
                                          businessHours: newHours,
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
                                  }
                                  setEditDayOfWeek(null);
                                  setTempDayBusinessHours([]);
                                }}
                              >
                                保存
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  setEditDayOfWeek(null);
                                  setTempDayBusinessHours([]);
                                }}
                              >
                                キャンセル
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <>
                            <Box
                              sx={
                                isMobile
                                  ? { display: 'block', flex: 1 }
                                  : { display: 'flex', flexWrap: 'nowrap', alignItems: 'center', flex: 1, whiteSpace: 'nowrap' }
                              }
                            >
                              {Array.isArray(hours.periods) && hours.periods.length > 0 ? (
                                hours.periods.map((period, pIdx) => (
                                  <span
                                    key={pIdx}
                                    style={{
                                      display: isMobile && pIdx > 0 ? 'block' : 'inline',
                                      marginLeft: isMobile && pIdx > 0 ? 88 : 0,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {pIdx === 0 ? (
                                      <>
                                        <span style={{ fontWeight: editDayOfWeek === hours.dayOfWeek ? 700 : 500, minWidth: 88, display: 'inline-block' }}>
                                          {dayLabel}
                                        </span>
                                        {editDayOfWeek === hours.dayOfWeek && (
                                          <Chip 
                                            label="選択中" 
                                            size="small" 
                                            color="primary" 
                                            variant="outlined"
                                            sx={{ ml: 1 }}
                                          />
                                        )}
                                        ：
                                      </>
                                    ) : null}
                                    {pIdx !== 0 && isMobile ? '　' : ''}
                                    {period.isOpen ? `${period.openTime}〜${period.closeTime}` : '休業'}
                                    {pIdx < hours.periods.length - 1 && (isMobile ? <><span> ／</span><br /></> : ' ／ ')}
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontWeight: 500, minWidth: 88, display: 'inline-block' }}>{dayLabel}：休業</span>
                              )}
                            </Box>
                            <Box sx={{ alignSelf: 'flex-start' }}>
                              <EditIconButton onClick={() => handleEditButton(() => {
                                setEditDayOfWeek(hours.dayOfWeek);
                                setTempDayBusinessHours(hours.periods.map(p => ({ ...p })));
                              })} />
                            </Box>
                          </>
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
            <Box sx={{ mt: 1 }}>
              {Array.isArray(specialBusinessDays) && specialBusinessDays.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {specialBusinessDays.map((day, idx) => {
                    const isEditing = editSpecialDayIndex === idx;
                    const isOpenDay = day.periods.some(p => p.isOpen);
                    return (
                      <li
                        key={day.date + '-' + idx}
                        style={{
                          marginBottom: 8,
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          backgroundColor: isEditing ? 'rgba(0, 0, 255, 0.05)' : 'transparent',
                          borderLeft: isEditing ? '4px solid #1976d2' : 'none',
                          paddingLeft: isEditing ? '8px' : '0',
                        }}
                      >
                        {isEditing ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                type="date"
                                value={tempSpecialDayDate}
                                onChange={e => setTempSpecialDayDate(e.target.value)}
                                size="small"
                                sx={{ width: isMobile ? 120 : 150 }}
                              />
                              <Chip label="編集中" size="small" color="primary" variant="outlined" />
                            </Box>
                            <FormControl component="fieldset" size="small">
                              <RadioGroup
                                row
                                value={tempSpecialDayPeriods.some(p => p.isOpen) ? 'open' : 'closed'}
                                onChange={e => {
                                  const isOpen = e.target.value === 'open';
                                  if (isOpen) {
                                    if (tempSpecialDayPeriods.length === 0) {
                                      setTempSpecialDayPeriods([{ isOpen: true, openTime: '09:00', closeTime: '18:00' }]);
                                    } else {
                                      setTempSpecialDayPeriods(tempSpecialDayPeriods.map(p => ({ ...p, isOpen: true })));
                                    }
                                  } else {
                                    setTempSpecialDayPeriods(tempSpecialDayPeriods.map(p => ({ ...p, isOpen: false })));
                                  }
                                }}
                              >
                                <FormControlLabel value="open" control={<Radio size="small" />} label="営業" />
                                <FormControlLabel value="closed" control={<Radio size="small" />} label="休業" />
                              </RadioGroup>
                            </FormControl>
                            {tempSpecialDayPeriods.some(p => p.isOpen) && (
                              <>
                                {tempSpecialDayPeriods.map((period, pIdx) => (
                                  <Box key={pIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TextField
                                      type="time"
                                      value={period.openTime}
                                      onChange={e => {
                                        const newPeriods = [...tempSpecialDayPeriods];
                                        newPeriods[pIdx] = { ...newPeriods[pIdx], openTime: e.target.value };
                                        // 重複チェック
                                        if (checkPeriodOverlap(newPeriods, pIdx)) {
                                          setError('時間帯が重複しています');
                                          return;
                                        }
                                        setError(null);
                                        setTempSpecialDayPeriods(newPeriods);
                                      }}
                                      size="small"
                                      required
                                      sx={{ width: 120 }}
                                    />
                                    <span>〜</span>
                                    <TextField
                                      type="time"
                                      value={period.closeTime}
                                      onChange={e => {
                                        const newPeriods = [...tempSpecialDayPeriods];
                                        newPeriods[pIdx] = { ...newPeriods[pIdx], closeTime: e.target.value };
                                        // 重複チェック
                                        if (checkPeriodOverlap(newPeriods, pIdx)) {
                                          setError('時間帯が重複しています');
                                          return;
                                        }
                                        setError(null);
                                        setTempSpecialDayPeriods(newPeriods);
                                      }}
                                      size="small"
                                      required
                                      sx={{ width: 120 }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        if (!window.confirm('この時間帯を削除しますか？')) return;
                                        setTempSpecialDayPeriods(tempSpecialDayPeriods.filter((_, i) => i !== pIdx));
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                ))}
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<span>＋</span>}
                                  onClick={() => {
                                    const periods = tempSpecialDayPeriods;
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
                                    const newPeriod = { isOpen: true, openTime: newOpen, closeTime: newClose };
                                    if (checkPeriodOverlap([...periods, newPeriod], periods.length)) {
                                      setError('時間帯が重複しています');
                                      return;
                                    }
                                    setTempSpecialDayPeriods([...periods, newPeriod]);
                                  }}
                                  sx={{ alignSelf: 'flex-start' }}
                                >
                                  時間帯追加
                                </Button>
                              </>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={async () => {
                                  // バリデーション: 日付重複・過去日
                                  if (!validateSpecialBusinessDay(tempSpecialDayDate)) {
                                    setError('特別営業日は今日以降の日付を指定してください');
                                    return;
                                  }
                                  if (specialBusinessDays.some((d, i) => d.date === tempSpecialDayDate && i !== idx)) {
                                    setError('同じ日付は重複して登録できません');
                                    return;
                                  }
                                  // 保存処理
                                  let newDays = [...specialBusinessDays];
                                  newDays[idx] = {
                                    ...newDays[idx],
                                    date: tempSpecialDayDate,
                                    periods: tempSpecialDayPeriods,
                                  };
                                  // 日付順にソート
                                  newDays = newDays.sort((a, b) => a.date.localeCompare(b.date));
                                  setSpecialBusinessDays(newDays);
                                  setEditSpecialDayIndex(null);
                                  setTempSpecialDayPeriods([]);
                                  setTempSpecialDayDate('');
                                  setError(null); // ここでエラーもクリア
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
                                        businessHours: businessHours,
                                        specialBusinessDays: newDays,
                                        logoUrl: store.logoUrl || null,
                                        isHolidayClosed: isHolidayClosed,
                                      };
                                      const updatedStore = await updateStore(data);
                                      setStore(updatedStore);
                                      setSuccessMessage('特別営業日を更新しました');
                                    } catch (err) {
                                      setError('特別営業日の更新に失敗しました');
                                      console.error('Error updating special business days:', err);
                                    }
                                  }
                                }}
                              >
                                保存
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  // 追加直後で日付が空の場合はリストから削除
                                  if (!tempSpecialDayDate) {
                                    const newDays = specialBusinessDays.slice(0, -1);
                                    setSpecialBusinessDays(newDays);
                                  }
                                  setEditSpecialDayIndex(null);
                                  setTempSpecialDayPeriods([]);
                                  setTempSpecialDayDate('');
                                  setError(null);
                                }}
                              >
                                キャンセル
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <>
                            <Box
                              sx={
                                isMobile
                                  ? { display: 'block', flex: 1 }
                                  : { display: 'flex', flexWrap: 'nowrap', alignItems: 'center', flex: 1, whiteSpace: 'nowrap' }
                              }
                            >
                              {Array.isArray(day.periods) && day.periods.length > 0 ? (
                                day.periods.map((period, pIdx) => (
                                  <span
                                    key={pIdx}
                                    style={{
                                      display: isMobile && pIdx > 0 ? 'block' : 'inline',
                                      marginLeft: isMobile && pIdx > 0 ? 88 : 0,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {pIdx === 0 ? (
                                      <>
                                        <span style={{ fontWeight: editSpecialDayIndex === idx ? 700 : 500, minWidth: 88, display: 'inline-block' }}>
                                          {day.date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, '$2/$3')}
                                        </span>
                                        {editSpecialDayIndex === idx && (
                                          <Chip label="選択中" size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />
                                        )}
                                        ：
                                      </>
                                    ) : null}
                                    {pIdx !== 0 && isMobile ? '　' : ''}
                                    {period.isOpen ? `${period.openTime}〜${period.closeTime}` : '休業'}
                                    {pIdx < day.periods.length - 1 && (isMobile ? <><span> ／</span><br /></> : ' ／ ')}
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontWeight: 500, minWidth: 88, display: 'inline-block' }}>{day.date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, '$2/$3')}：休業</span>
                              )}
                            </Box>
                            <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1 }}>
                              <EditIconButton onClick={() => handleEditButton(() => {
                                setEditSpecialDayIndex(idx);
                                setTempSpecialDayPeriods(day.periods.map(p => ({ ...p })));
                                setTempSpecialDayDate(day.date);
                              })} />
                              <IconButton color="error" onClick={async () => {
                                if (!window.confirm('この特別営業日を削除しますか？')) return;
                                let newDays = specialBusinessDays.filter((_, i) => i !== idx);
                                newDays = newDays.sort((a, b) => a.date.localeCompare(b.date));
                                setSpecialBusinessDays(newDays);
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
                                      businessHours: businessHours,
                                      specialBusinessDays: newDays,
                                      logoUrl: store.logoUrl || null,
                                      isHolidayClosed: isHolidayClosed,
                                    };
                                    const updatedStore = await updateStore(data);
                                    setStore(updatedStore);
                                    setSuccessMessage('特別営業日を削除しました');
                                  } catch (err) {
                                    setError('特別営業日の削除に失敗しました');
                                    console.error('Error deleting special business day:', err);
                                  }
                                }
                              }}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Typography sx={{ color: 'text.secondary' }}>未設定</Typography>
              )}
              <Button color="primary" variant="outlined" onClick={() => handleEditButton(() => {
                const newDay = {
                  date: '',
                  periods: [{ isOpen: true, openTime: '09:00', closeTime: '18:00' }],
                };
                const newDays = [...specialBusinessDays, newDay];
                setSpecialBusinessDays(newDays);
                setEditSpecialDayIndex(newDays.length - 1);
                setTempSpecialDayPeriods(newDay.periods);
                setTempSpecialDayDate('');
              })} startIcon={<span>＋</span>} sx={{ mt: 2 }}>特別営業日追加</Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
}; 