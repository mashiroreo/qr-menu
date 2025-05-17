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
import { BusinessHours, DayOfWeek } from '../../types/store';

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
  const { control, watch, formState: { errors } } = useForm<{ businessHours: BusinessHours[] }>({
    defaultValues: {
      businessHours: value.length > 0 ? value : DAYS_OF_WEEK.map(day => ({
        dayOfWeek: day.value,
        isOpen: false,
        openTime: '09:00',
        closeTime: '18:00',
      })),
    },
  });

  const businessHours = watch('businessHours');

  const validateTimeRange = (openTime: string, closeTime: string) => {
    if (!openTime || !closeTime) return true;
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    return openMinutes < closeMinutes;
  };

  const handleChange = (newValue: BusinessHours[]) => {
    // 時間のバリデーション
    const isValid = newValue.every(hours => 
      !hours.isOpen || validateTimeRange(hours.openTime, hours.closeTime)
    );
    
    if (isValid) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        営業時間
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DAYS_OF_WEEK.map((day, index) => {
            const hours = businessHours[index];
            const hasError = hours?.isOpen && !validateTimeRange(hours.openTime, hours.closeTime);
            
            return (
              <Box key={day.value} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Controller
                      name={`businessHours.${index}.isOpen`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                            const newValue = [...businessHours];
                            newValue[index] = {
                              ...newValue[index],
                              isOpen: e.target.checked,
                            };
                            handleChange(newValue);
                          }}
                        />
                      )}
                    />
                  }
                  label={day.label}
                />
                {hours?.isOpen && (
                  <>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Controller
                        name={`businessHours.${index}.openTime`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              const newValue = [...businessHours];
                              newValue[index] = {
                                ...newValue[index],
                                openTime: e.target.value,
                              };
                              handleChange(newValue);
                            }}
                            error={hasError}
                          >
                            {TIME_OPTIONS.map((time) => (
                              <MenuItem key={time} value={time}>
                                {time}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>
                    <Typography>〜</Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Controller
                        name={`businessHours.${index}.closeTime`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              const newValue = [...businessHours];
                              newValue[index] = {
                                ...newValue[index],
                                closeTime: e.target.value,
                              };
                              handleChange(newValue);
                            }}
                            error={hasError}
                          >
                            {TIME_OPTIONS.map((time) => (
                              <MenuItem key={time} value={time}>
                                {time}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>
                    {hasError && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        開店時間は閉店時間より前である必要があります
                      </Alert>
                    )}
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}; 