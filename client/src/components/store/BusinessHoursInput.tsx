import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  Typography,
  Paper,
  Alert,
  Button,
} from '@mui/material';
import { BusinessHours, DayOfWeek, BusinessHourPeriod } from '../../types/store';
import DeleteIcon from '@mui/icons-material/Delete';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: '月曜日' },
  { value: 'tuesday', label: '火曜日' },
  { value: 'wednesday', label: '水曜日' },
  { value: 'thursday', label: '木曜日' },
  { value: 'friday', label: '金曜日' },
  { value: 'saturday', label: '土曜日' },
  { value: 'sunday', label: '日曜日' },
];

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

type BusinessHoursInputProps = {
  value: BusinessHours[];
  onChange: (value: BusinessHours[]) => void;
};

export const BusinessHoursInput: React.FC<BusinessHoursInputProps> = ({ value, onChange }) => {
  // periods配列に対応した初期値生成
  const getDefaultPeriods = () => ([{
    isOpen: false,
    openTime: '09:00',
    closeTime: '18:00',
  }]);

  // valueが空なら曜日ごとに1件periodsを持つ初期値
  const defaultBusinessHours: BusinessHours[] = DAYS_OF_WEEK.map(day => ({
    dayOfWeek: day.value,
    periods: getDefaultPeriods(),
  }));

  // valueを新型に補正
  const normalizeBusinessHours = (input: any[]): BusinessHours[] => {
    return DAYS_OF_WEEK.map((day, idx) => {
      const item = input.find((h) => h.dayOfWeek === day.value) || {};
      // 旧型（openTime/closeTime/isOpen）→新型（periods配列）に変換
      if (Array.isArray(item.periods)) {
        return {
          dayOfWeek: day.value,
          periods: item.periods.length > 0 ? item.periods : getDefaultPeriods(),
        };
      } else {
        // 旧型の場合
        return {
          dayOfWeek: day.value,
          periods: [
            {
              isOpen: item.isOpen ?? false,
              openTime: item.openTime ?? '09:00',
              closeTime: item.closeTime ?? '18:00',
            },
          ],
        };
      }
    });
  };

  const [businessHours, setBusinessHours] = React.useState<BusinessHours[]>(
    value.length > 0 ? normalizeBusinessHours(value) : defaultBusinessHours
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 時間帯追加
  const handleAddPeriod = (dayIdx: number) => {
    const newHours = [...businessHours];
    newHours[dayIdx] = {
      ...newHours[dayIdx],
      periods: [
        ...newHours[dayIdx].periods,
        { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      ],
    };
    setBusinessHours(newHours);
    onChange(newHours);
  };

  // 時間帯削除
  const handleRemovePeriod = (dayIdx: number, periodIdx: number) => {
    const newHours = [...businessHours];
    newHours[dayIdx] = {
      ...newHours[dayIdx],
      periods: newHours[dayIdx].periods.filter((_, i) => i !== periodIdx),
    };
    setBusinessHours(newHours);
    onChange(newHours);
  };

  // 値変更
  const handlePeriodChange = (dayIdx: number, periodIdx: number, field: keyof BusinessHourPeriod, value: any) => {
    const newHours = [...businessHours];
    newHours[dayIdx] = {
      ...newHours[dayIdx],
      periods: newHours[dayIdx].periods.map((p, i) =>
        i === periodIdx ? { ...p, [field]: value } : p
      ),
    };
    setBusinessHours(newHours);
    onChange(newHours);
  };

  // バリデーション
  const validateTimeRange = (openTime: string, closeTime: string) => {
    if (!openTime || !closeTime) return true;
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    // 開始と終了が同じ場合のみNG
    return openMinutes !== closeMinutes;
  };

  // 時間帯の重複チェック
  const checkTimeOverlap = (periods: BusinessHourPeriod[], currentIdx: number): boolean => {
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

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        営業時間
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DAYS_OF_WEEK.map((day, dayIdx) => {
            // その曜日のperiodsがすべてisOpen: falseなら休業扱い
            const isOpenDay = businessHours[dayIdx].periods.some(p => p.isOpen);
            return (
              <Box key={day.value} sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                  <Typography variant="subtitle1">{day.label}</Typography>
                  <FormControl component="fieldset" size="small">
                    <RadioGroup
                      row
                      value={isOpenDay ? 'open' : 'closed'}
                      onChange={e => {
                        const open = e.target.value === 'open';
                        const newHours = [...businessHours];
                        if (open) {
                          // 既存periodsが全てisOpen: falseなら1枠追加
                          if (!isOpenDay) {
                            newHours[dayIdx].periods = [{ isOpen: true, openTime: '09:00', closeTime: '18:00' }];
                          } else {
                            // 既存periodsのisOpenを全てtrueに
                            newHours[dayIdx].periods = newHours[dayIdx].periods.map(p => ({ ...p, isOpen: true }));
                          }
                        } else {
                          // 全てisOpen: falseに
                          newHours[dayIdx].periods = newHours[dayIdx].periods.map(p => ({ ...p, isOpen: false }));
                        }
                        setBusinessHours(newHours);
                        onChange(newHours);
                      }}
                    >
                      <FormControlLabel value="open" control={<Radio />} label="営業" />
                      <FormControlLabel value="closed" control={<Radio />} label="休業" />
                    </RadioGroup>
                  </FormControl>
                </Box>
                {isOpenDay ? (
                  <>
                    {businessHours[dayIdx].periods.map((period, periodIdx) => {
                      if (!period.isOpen) return null;
                      const hasError = period.isOpen && !validateTimeRange(period.openTime, period.closeTime);
                      const hasOverlap = period.isOpen && checkTimeOverlap(businessHours[dayIdx].periods, periodIdx);
                      return (
                        <Box
                          key={periodIdx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                            minHeight: 48,
                            flexWrap: 'nowrap',
                            width: '100%',
                            maxWidth: '100%',
                          }}
                        >
                          <FormControl size="small" sx={{ minWidth: isMobile ? 60 : 120, flexShrink: 1 }}>
                            <Select
                              value={period.openTime || ''}
                              onChange={e => handlePeriodChange(dayIdx, periodIdx, 'openTime', e.target.value)}
                              error={hasError || hasOverlap}
                            >
                              {TIME_OPTIONS.map((time) => (
                                <MenuItem key={time} value={time}>{time}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Typography>〜</Typography>
                          <FormControl size="small" sx={{ minWidth: isMobile ? 60 : 120, flexShrink: 1 }}>
                            <Select
                              value={period.closeTime || ''}
                              onChange={e => handlePeriodChange(dayIdx, periodIdx, 'closeTime', e.target.value)}
                              error={hasError || hasOverlap}
                            >
                              {TIME_OPTIONS.map((time) => (
                                <MenuItem key={time} value={time}>{time}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {businessHours[dayIdx].periods.length > 1 && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemovePeriod(dayIdx, periodIdx)}
                              sx={{ minWidth: isMobile ? 32 : 60, ml: 1, alignSelf: 'center', py: 1 }}
                              variant="outlined"
                              aria-label="削除"
                            >
                              {isMobile ? <DeleteIcon fontSize="small" /> : '削除'}
                            </Button>
                          )}
                          {(hasError || hasOverlap) && (
                            <Alert severity="error" sx={{ mt: 1, width: '100%' }}>
                              {hasError
                                ? '開始時刻と終了時刻は異なる必要があります'
                                : '時間帯が重複しています'}
                            </Alert>
                          )}
                        </Box>
                      );
                    })}
                    <Button
                      size="small"
                      onClick={() => handleAddPeriod(dayIdx)}
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
        </Box>
      </Paper>
    </Box>
  );
}; 