import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BusinessHoursInput } from './BusinessHoursInput';
import { BusinessHours } from '../../types/store';

// MUI が内部で window.matchMedia を参照するためモックを設定
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('BusinessHoursInput', () => {
  const closedMonday: BusinessHours[] = [
    {
      dayOfWeek: 'monday',
      periods: [{ isOpen: false, openTime: '09:00', closeTime: '18:00' }],
    },
  ];

  it('営業ラジオのクリックで onChange が呼び出される', async () => {
    const handleChange = jest.fn();
    render(<BusinessHoursInput value={closedMonday} onChange={handleChange} />);

    const radios = await screen.findAllByRole('radio', { name: '営業' });
    await userEvent.click(radios[0]);

    expect(handleChange).toHaveBeenCalledTimes(1);
    const updated = handleChange.mock.calls[0][0] as BusinessHours[];
    expect(updated[0].periods[0].isOpen).toBe(true);
  });

  it('開始と終了が同じ時刻の場合にエラーを表示', async () => {
    const invalidTime: BusinessHours[] = [
      {
        dayOfWeek: 'monday',
        periods: [{ isOpen: true, openTime: '10:00', closeTime: '10:00' }],
      },
    ];
    render(<BusinessHoursInput value={invalidTime} onChange={() => {}} />);

    expect(
      await screen.findByText('開始時刻と終了時刻は異なる必要があります')
    ).toBeInTheDocument();
  });

  it('時間帯が重複している場合にエラーを表示', async () => {
    const overlap: BusinessHours[] = [
      {
        dayOfWeek: 'monday',
        periods: [
          { isOpen: true, openTime: '10:00', closeTime: '11:00' },
          { isOpen: true, openTime: '10:30', closeTime: '12:00' },
        ],
      },
    ];
    render(<BusinessHoursInput value={overlap} onChange={() => {}} />);

    const errors = await screen.findAllByText('時間帯が重複しています');
    expect(errors.length).toBeGreaterThan(0);
  });
}); 