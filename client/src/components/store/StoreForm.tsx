import { useState, useEffect } from 'react';
import { Store, StoreFormData, BusinessHours, SpecialBusinessDay, BusinessHourPeriod } from '../../types/store';
import { getStoreInfo, updateStore } from '../../api/store';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { EditIconButton } from '../common/EditIconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export const StoreForm = () => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setIsEditingBusinessHours] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tempBusinessHours, setTempBusinessHours] = useState<BusinessHours[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setIsEditingSpecialDays] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const [lastUpdatedField, setLastUpdatedField] = useState<string | null>(null);

  // 追加: 各項目ごとのバリデーションエラーstate
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

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
    setNameError(null);
    setDescriptionError(null);
    setAddressError(null);
    setPhoneError(null);
    // 必須バリデーション
    if (field === 'name' && !editValues.name.trim()) {
      setNameError('店舗名は必須です');
      return;
    }
    if (field === 'description' && !editValues.description.trim()) {
      setDescriptionError('店舗説明は必須です');
      return;
    }
    if (field === 'address' && !editValues.address.trim()) {
      setAddressError('住所は必須です');
      return;
    }
    if (field === 'phone' && !editValues.phone.trim()) {
      setPhoneError('電話番号は必須です');
      return;
    }
    if (field === 'phone' && !/^[0-9]+$/.test(editValues.phone)) {
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
      setLastUpdatedField(field);
      setEditField(null);
    } catch (err) {
      setError('店舗情報の更新に失敗しました');
      console.error('Error updating store info:', err);
    }
  };

  // --- ユーティリティ: 時間帯重複チェック ---
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
      const isCurrentOvernight = cOpen > cClose;
      const isPOtherOvernight = pOpen > pClose;
      if (isCurrentOvernight && isPOtherOvernight) return true;
      if (isCurrentOvernight) return (pOpen <= cClose || pOpen >= cOpen) || (pClose <= cClose || pClose >= cOpen);
      if (isPOtherOvernight) return (cOpen <= pClose || cOpen >= pOpen) || (cClose <= pClose || cClose >= pOpen);
      return cOpen < pClose && cClose > pOpen;
    });
  };

  // 編集ボタン共通ラッパー
  const handleEditButton = (editAction: () => void) => {
    const isAnyEditing = editField !== null || editDayOfWeek !== null || editSpecialDayIndex !== null || isEditingHoliday;
    if (isAnyEditing) {
      window.alert('編集中の項目があります。入力を完了してください。');
      return;
    }
    editAction();
  };

  // 祝日営業フラグ編集ハンドラ
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
    try {
      const data: StoreFormData = {
        ...store,
        name: editValues.name,
        description: editValues.description,
        address: editValues.address,
        phone: editValues.phone,
        businessHours,
        specialBusinessDays,
        logoUrl: store.logoUrl || null,
        isHolidayClosed: tempIsHolidayClosed,
      };
      const updatedStore = await updateStore(data);
      setStore(updatedStore);
      setIsHolidayClosed(tempIsHolidayClosed);
      setLastUpdatedField('holiday');
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
      
      {/* {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )} */}
      
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
                  <Button variant="outlined" size="small" onClick={() => { setEditField(null); setEditValues(v => ({ ...v, name: store?.name || '' })); setNameError(null); }}>キャンセル</Button>
                </Box>
                {nameError && <Alert severity="error" sx={{ mt: 1 }}>{nameError}</Alert>}
              </Box>
            ) : (
              <>
                <Typography sx={{ mt: 0.5 }}>{store?.name || '-'}</Typography>
                {lastUpdatedField === 'name' && (
                  <Alert severity="success" sx={{ mt: 1 }}>店舗名を更新しました</Alert>
                )}
              </>
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
                  <Button variant="outlined" size="small" onClick={() => { setEditField(null); setEditValues(v => ({ ...v, description: store?.description || '' })); setDescriptionError(null); }}>キャンセル</Button>
                </Box>
                {descriptionError && <Alert severity="error" sx={{ mt: 1 }}>{descriptionError}</Alert>}
              </Box>
            ) : (
              <>
                <Typography sx={{ mt: 0.5 }}>{store?.description || '-'}</Typography>
                {lastUpdatedField === 'description' && (
                  <Alert severity="success" sx={{ mt: 1 }}>店舗説明を更新しました</Alert>
                )}
              </>
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
                  <Button variant="outlined" size="small" onClick={() => { setEditField(null); setEditValues(v => ({ ...v, address: store?.address || '' })); setAddressError(null); }}>キャンセル</Button>
                </Box>
                {addressError && <Alert severity="error" sx={{ mt: 1 }}>{addressError}</Alert>}
              </Box>
            ) : (
              <>
                <Typography sx={{ mt: 0.5 }}>{store?.address || '-'}</Typography>
                {lastUpdatedField === 'address' && (
                  <Alert severity="success" sx={{ mt: 1 }}>住所を更新しました</Alert>
                )}
              </>
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
                  <Button variant="outlined" size="small" onClick={() => { setEditField(null); setEditValues(v => ({ ...v, phone: store?.phone || '' })); setPhoneError(null); }}>キャンセル</Button>
                </Box>
                {phoneError && <Alert severity="error" sx={{ mt: 1 }}>{phoneError}</Alert>}
              </Box>
            ) : (
              <>
                <Typography sx={{ mt: 0.5 }}>{store?.phone || '-'}</Typography>
                {lastUpdatedField === 'phone' && (
                  <Alert severity="success" sx={{ mt: 1 }}>電話番号を更新しました</Alert>
                )}
              </>
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
              <Box sx={{ backgroundColor: 'rgba(0, 0, 255, 0.05)', borderLeft: '4px solid #1976d2', pl: 1.5, py: 1, borderRadius: 1, mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label="編集中" size="small" color="primary" variant="outlined" />
                </Box>
                <RadioGroup
                  row
                  value={tempIsHolidayClosed ? 'closed' : 'open'}
                  onChange={e => setTempIsHolidayClosed(e.target.value === 'closed')}
                >
                  <FormControlLabel value="open" control={<Radio />} label="祝日も営業" />
                  <FormControlLabel value="closed" control={<Radio />} label="祝日は休業" />
                </RadioGroup>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" size="small" onClick={handleHolidaySave}>保存</Button>
                  <Button variant="outlined" size="small" onClick={handleHolidayCancel}>キャンセル</Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ mt: 0.5 }}>
                    {isHolidayClosed ? '祝日は休業' : '祝日も営業'}
                  </Typography>
                  {lastUpdatedField === 'holiday' && (
                    <Alert severity="success" sx={{ mt: 1 }}>祝日の営業情報を更新しました</Alert>
                  )}
                </Box>
                <EditIconButton onClick={() => handleEditButton(handleHolidayEdit)} />
              </Box>
            )}
          </Box>
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
                    return (
                      <li
                        key={hours.dayOfWeek + '-' + idx}
                        style={{
                          marginBottom: 4,
                          display: 'block',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          backgroundColor: editDayOfWeek === hours.dayOfWeek ? 'rgba(0, 0, 255, 0.05)' : 'transparent',
                          borderLeft: editDayOfWeek === hours.dayOfWeek ? '4px solid #1976d2' : 'none',
                          paddingLeft: editDayOfWeek === hours.dayOfWeek ? '8px' : '0',
                        }}
                      >
                        {editDayOfWeek === hours.dayOfWeek ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span style={{ fontWeight: 500 }}>{dayLabel}</span>
                              <Chip label="編集中" size="small" color="primary" variant="outlined" />
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
                                          if (checkPeriodOverlap(newHours, pIdx)) {
                                            setError('時間帯が重複しています');
                                            return;
                                          }
                                          setError(null);
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
                                          if (checkPeriodOverlap(newHours, pIdx)) {
                                            setError('時間帯が重複しています');
                                            return;
                                          }
                                          setError(null);
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
                                    if (store) {
                                      setError(null);
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
                                        setLastUpdatedField(`businessHours-${editDayOfWeek}`);
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
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                              }}
                            >
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
                                          <span style={{ fontWeight: 500, minWidth: 88, display: 'inline-block' }}>
                                            {dayLabel}
                                          </span>
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
                            </Box>
                            {lastUpdatedField === `businessHours-${hours.dayOfWeek}` && (
                              <Alert severity="success" sx={{ mt: 1 }}>{dayLabel}の営業時間を更新しました</Alert>
                            )}
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'text.secondary' }}>未設定</Typography>
                  <EditIconButton
                    onClick={() => handleEditButton(() => {
                      // デフォルトの営業時間データを生成（月曜営業、他休業）
                      const defaultHours: BusinessHours[] = [
                        { dayOfWeek: 'monday', periods: [{ isOpen: true, openTime: '09:00', closeTime: '17:00' }] },
                        { dayOfWeek: 'tuesday', periods: [{ isOpen: false, openTime: '09:00', closeTime: '17:00' }] },
                        { dayOfWeek: 'wednesday', periods: [{ isOpen: false, openTime: '09:00', closeTime: '17:00' }] },
                        { dayOfWeek: 'thursday', periods: [{ isOpen: false, openTime: '09:00', closeTime: '17:00' }] },
                        { dayOfWeek: 'friday', periods: [{ isOpen: false, openTime: '09:00', closeTime: '17:00' }] },
                        { dayOfWeek: 'saturday', periods: [{ isOpen: false, openTime: '09:00', closeTime: '17:00' }] },
                        { dayOfWeek: 'sunday', periods: [{ isOpen: false, openTime: '09:00', closeTime: '17:00' }] },
                      ];
                      setBusinessHours(defaultHours);
                      setEditDayOfWeek('monday');
                      setTempDayBusinessHours([...defaultHours[0].periods]);
                    })}
                  />
                </Box>
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
                    return (
                      <li
                        key={day.date + '-' + idx}
                        style={{
                          marginBottom: 8,
                          display: 'block',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          backgroundColor: editSpecialDayIndex === idx ? 'rgba(0, 0, 255, 0.05)' : 'transparent',
                          borderLeft: editSpecialDayIndex === idx ? '4px solid #1976d2' : 'none',
                          paddingLeft: editSpecialDayIndex === idx ? '8px' : '0',
                        }}
                      >
                        {editSpecialDayIndex === idx ? (
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
                                      setLastUpdatedField(`specialBusinessDay-${tempSpecialDayDate}`);
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
                                  // 新規分かどうか判定
                                  const isNew =
                                    !specialBusinessDays[editSpecialDayIndex]?.date ||
                                    specialBusinessDays.filter((d, i) => d.date === specialBusinessDays[editSpecialDayIndex]?.date && i !== editSpecialDayIndex).length === 0;
                                  if (isNew) {
                                    // 新規分はリストから削除
                                    const newDays = specialBusinessDays.filter((_, i) => i !== editSpecialDayIndex);
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
                            {error && (
                              <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
                            )}
                          </Box>
                        ) : (
                          <>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                              }}
                            >
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
                                          <span style={{ fontWeight: 500, minWidth: 88, display: 'inline-block' }}>
                                            {day.date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, '$2/$3')}
                                          </span>
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
                                      setLastUpdatedField(`specialBusinessDay-${day.date}`);
                                    } catch (err) {
                                      setError('特別営業日の削除に失敗しました');
                                      console.error('Error deleting special business day:', err);
                                    }
                                  }
                                }}>
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>
                            {lastUpdatedField === `specialBusinessDay-${day.date}` && (
                              <Alert severity="success" sx={{ mt: 1 }}>{day.date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, '$2/$3')}の特別営業日を更新しました</Alert>
                            )}
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