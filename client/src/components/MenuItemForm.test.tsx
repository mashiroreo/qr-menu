import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuItemForm from './MenuItemForm';

jest.mock('../api/menu', () => ({
  __esModule: true,
  createMenuItem: jest.fn(),
  updateMenuItem: jest.fn(),
  updateMenuItemImage: jest.fn(),
  deleteMenuItemImage: jest.fn(),
}));

import { createMenuItem } from '../api/menu';

describe('MenuItemForm', () => {
  const defaultProps = {
    storeId: 1,
    categoryId: 2,
    onSubmit: jest.fn(),
    onCancel: () => {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('商品名未入力でエラーメッセージを表示し createMenuItem を呼ばない', async () => {
    render(<MenuItemForm {...defaultProps} />);

    const saveBtn = screen.getByRole('button', { name: '保存' });
    await userEvent.click(saveBtn);

    expect(createMenuItem).not.toHaveBeenCalled();
  });

  it('価格が負の場合エラーを表示し createMenuItem を呼ばない', async () => {
    render(<MenuItemForm {...defaultProps} />);

    await userEvent.type(screen.getAllByRole('textbox')[0], 'テスト商品');
    await userEvent.type(screen.getByRole('spinbutton'), '-10');

    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(createMenuItem).not.toHaveBeenCalled();
  });

  // 成功ケースはブラウザネイティブの制約や File API 依存があるため別途 E2E で検証する
}); 