import { render, screen } from '@testing-library/react';
import MenuItemList from './MenuItemList';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { deleteMenuItem } from '../api/menu';

// api/menu.tsの関数をモック
jest.mock('../api/menu', () => ({
  getMenuItems: jest.fn().mockResolvedValue([
    { id: 1, name: 'テストメニュー', price: 100, categoryId: 1, storeId: 1 }
  ]),
  deleteMenuItem: jest.fn(),
  reorderMenuItems: jest.fn(),
}));

describe('MenuItemList', () => {
  it('renders without crashing', async () => {
    render(<MenuItemList storeId={1} categoryId={1} onEdit={() => {}} />);
    expect(await screen.findByText(/テストメニュー/)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const handleEdit = jest.fn();
    render(<MenuItemList storeId={1} categoryId={1} onEdit={handleEdit} />);

    // ボタンが表示されるまで待機
    const editButton = await screen.findByRole('button', { name: '編集' });
    await userEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleEdit).toHaveBeenCalledWith({ id: 1, name: 'テストメニュー', price: 100, categoryId: 1, storeId: 1 });
  });

  it('calls deleteMenuItem API when delete is confirmed', async () => {
    // confirm ダイアログを常にOKに
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<MenuItemList storeId={1} categoryId={1} onEdit={() => {}} />);

    const deleteButton = await screen.findByRole('button', { name: '削除' });

    await act(async () => {
      await userEvent.click(deleteButton);
    });

    expect(deleteMenuItem).toHaveBeenCalledTimes(1);
    expect(deleteMenuItem).toHaveBeenCalledWith(1);

    // confirm を元に戻す
    (window.confirm as jest.Mock).mockRestore();
  });
}); 