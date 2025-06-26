import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuCategoryForm from './MenuCategoryForm';

// API モック
jest.mock('../api/menu', () => ({
  __esModule: true,
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
}));

import { createCategory, updateCategory } from '../api/menu';

describe('MenuCategoryForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('必須項目が未入力の場合 createCategory を呼ばない', async () => {
    const handleSuccess = jest.fn();
    render(<MenuCategoryForm onSuccess={handleSuccess} onCancel={() => {}} />);

    // 保存ボタン押下
    const saveBtn = screen.getByRole('button', { name: '保存' });
    await userEvent.click(saveBtn);

    expect(createCategory).not.toHaveBeenCalled();
    expect(handleSuccess).not.toHaveBeenCalled();
  });

  it('正しい入力で createCategory と onSuccess が呼ばれる', async () => {
    (createCategory as jest.Mock).mockResolvedValue({ id: 1, name: '新カテゴリ' });
    const handleSuccess = jest.fn();

    render(<MenuCategoryForm onSuccess={handleSuccess} onCancel={() => {}} />);

    const nameInput = screen.getAllByRole('textbox')[0];
    await userEvent.type(nameInput, '新カテゴリ');

    const saveBtn = screen.getByRole('button', { name: '保存' });
    await userEvent.click(saveBtn);

    expect(createCategory).toHaveBeenCalledTimes(1);
    expect(createCategory).toHaveBeenCalledWith({ name: '新カテゴリ', description: '' });
    expect(handleSuccess).toHaveBeenCalled();
  });

  it('category prop がある場合 updateCategory が呼ばれる', async () => {
    const mockCategory = { id: 10, name: '既存', description: 'desc', storeId: 1, order: 0, createdAt: '', updatedAt: '' };
    (updateCategory as jest.Mock).mockResolvedValue({ ...mockCategory, name: '更新後' });
    const handleSuccess = jest.fn();

    render(
      <MenuCategoryForm category={mockCategory} onSuccess={handleSuccess} onCancel={() => {}} />
    );

    const nameInput = screen.getAllByRole('textbox')[0];
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '更新後');

    const saveBtn = screen.getByRole('button', { name: '保存' });
    await userEvent.click(saveBtn);

    expect(updateCategory).toHaveBeenCalledWith(10, { name: '更新後', description: 'desc' });
    expect(handleSuccess).toHaveBeenCalled();
  });
}); 