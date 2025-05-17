import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { BusinessHours, DayOfWeek, BusinessHourPeriod } from '../../types/store';

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
    return openMinutes < closeMinutes;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        営業時間
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DAYS_OF_WEEK.map((day, dayIdx) => (
            <Box key={day.value} sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>{day.label}</Typography>
              {businessHours[dayIdx].periods.map((period, periodIdx) => {
                const hasError = period.isOpen && !validateTimeRange(period.openTime, period.closeTime);
                return (
                  <Box key={periodIdx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={period.isOpen}
                          onChange={e => handlePeriodChange(dayIdx, periodIdx, 'isOpen', e.target.checked)}
                        />
                      }
                      label={periodIdx === 0 ? '' : `時間帯${periodIdx + 1}`}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={period.openTime || ''}
                        onChange={e => handlePeriodChange(dayIdx, periodIdx, 'openTime', e.target.value)}
                        error={hasError}
                      >
                        {TIME_OPTIONS.map((time) => (
                          <MenuItem key={time} value={time}>{time}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography>〜</Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={period.closeTime || ''}
                        onChange={e => handlePeriodChange(dayIdx, periodIdx, 'closeTime', e.target.value)}
                        error={hasError}
                      >
                        {TIME_OPTIONS.map((time) => (
                          <MenuItem key={time} value={time}>{time}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {businessHours[dayIdx].periods.length > 1 && (
                      <button type="button" onClick={() => handleRemovePeriod(dayIdx, periodIdx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                        削除
                      </button>
                    )}
                    {hasError && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        開店時間は閉店時間より前である必要があります
                      </Alert>
                    )}
                  </Box>
                );
              })}
              <button type="button" onClick={() => handleAddPeriod(dayIdx)} style={{ marginTop: 4 }}>
                ＋時間帯追加
              </button>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}; 