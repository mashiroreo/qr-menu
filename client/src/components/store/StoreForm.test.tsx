import { render, screen, within } from '@testing-library/react';
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

  it.skip('電話番号入力バリデーションのエラー表示と updateStore 呼び出しを確認', async () => {
    (getStoreInfo as jest.Mock).mockResolvedValue(mockStore);
    (updateStore as jest.Mock).mockResolvedValue({ ...mockStore, phone: '0123456789' });

    render(<StoreForm />);

    await screen.findByText('電話番号');

    // ページ内で最初の編集ボタンをクリックし電話番号の編集モードに入る
    const editButton = screen.getAllByRole('button', { name: '編集' })[0];
    await userEvent.click(editButton);

    // 入力フィールドに無効値を入力
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'abc');

    // 保存
    const saveButton2 = screen.getByRole('button', { name: '保存' });
    await userEvent.click(saveButton2);

    // エラーメッセージ表示 (画面に Alert が出ることを確認)
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // 有効な値を入力
    await userEvent.clear(input);
    await userEvent.type(input, '0123456789');
    await userEvent.click(saveButton2);

    expect(updateStore).toHaveBeenCalledTimes(2);
    expect(updateStore).toHaveBeenLastCalledWith(expect.objectContaining({ phone: '0123456789' }));
  });
}); 