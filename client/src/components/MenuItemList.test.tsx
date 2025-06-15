import { render, screen } from '@testing-library/react';
import MenuItemList from './MenuItemList';

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
}); 