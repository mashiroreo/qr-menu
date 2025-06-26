import { render, screen, fireEvent } from '@testing-library/react';
import MenuCategoryList from './MenuCategoryList';
import { act } from 'react-dom/test-utils';

// api/menu.ts の関数をモック
jest.mock('../api/menu', () => ({
  getCategories: jest.fn().mockResolvedValue([
    { id: 1, name: 'Cat A', description: 'desc', order: 0, storeId: 1 },
    { id: 2, name: 'Cat B', description: 'desc', order: 1, storeId: 1 },
  ]),
  deleteCategory: jest.fn().mockResolvedValue(undefined),
  reorderCategories: jest.fn().mockResolvedValue({ success: true }),
}));

describe('MenuCategoryList', () => {
  it('renders categories in order', async () => {
    render(<MenuCategoryList onEdit={() => {}} />);
    expect(await screen.findByText('Cat A')).toBeInTheDocument();
    expect(screen.getByText('Cat B')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button clicked', async () => {
    const onEdit = jest.fn();
    render(<MenuCategoryList onEdit={onEdit} />);

    const editButtons = await screen.findAllByText('編集');
    expect(editButtons.length).toBeGreaterThan(0);

    act(() => {
      fireEvent.click(editButtons[0]);
    });

    expect(onEdit).toHaveBeenCalledWith({ id: 1, name: 'Cat A', description: 'desc', order: 0, storeId: 1 });
  });
}); 