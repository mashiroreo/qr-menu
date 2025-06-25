import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreForm } from './StoreForm';

// モック API
jest.mock('../../api/store', () => ({
  __esModule: true,
  getStoreInfo: jest.fn(),
  updateStore: jest.fn(),
}));

import { getStoreInfo, updateStore } from '../../api/store';

describe('StoreForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStore = {
    id: '1',
    name: 'テスト店舗',
    description: '説明',
    logoUrl: null,
    businessHours: [],
    createdAt: '',
    updatedAt: '',
    address: '住所',
    phone: '09012345678',
    isHolidayClosed: false,
    specialBusinessDays: [],
  };

  it('電話番号入力バリデーションのエラー表示と updateStore 呼び出しを確認', async () => {
    (getStoreInfo as jest.Mock).mockResolvedValue(mockStore);
    (updateStore as jest.Mock).mockResolvedValue({ ...mockStore, phone: '0123456789' });

    render(<StoreForm />);

    // 電話番号セクション見出し
    const phoneHeading = await screen.findByText('電話番号');
    const section = phoneHeading.closest('div') as HTMLElement;

    // 編集ボタンをクリック
    const editBtn = (section?.parentElement as HTMLElement).querySelector('button[aria-label="編集"]') as HTMLElement;
    await userEvent.click(editBtn);

    // 無効値入力
    const input = within(section).getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'abc');

    const saveBtn = within(section).getByRole('button', { name: '保存' });
    await userEvent.click(saveBtn);

    expect(within(section).getByRole('alert')).toBeInTheDocument();

    // 有効値入力
    await userEvent.clear(input);
    await userEvent.type(input, '0123456789');
    await userEvent.click(saveBtn);

    await waitFor(() => expect(updateStore).toHaveBeenCalledTimes(1));
    expect(updateStore).toHaveBeenLastCalledWith(expect.objectContaining({ phone: '0123456789' }));
  });
}); 