import React from 'react';

// --- dnd-kit モック ---
jest.mock('@dnd-kit/core', () => {
  return {
    __esModule: true,
    DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: { active: { id: number }; over: { id: number } }) => void }) => {
      // 初回レンダリングで即座に onDragEnd を呼び出して並び替えをトリガ
      React.useEffect(() => {
        onDragEnd({ active: { id: 1 }, over: { id: 2 } });
      }, [onDragEnd]);
      return <div>{children}</div>;
    },
    closestCenter: jest.fn(),
    KeyboardSensor: jest.fn(),
    PointerSensor: jest.fn(),
    useSensor: jest.fn(),
    useSensors: () => [],
  };
});

// --- sortable モック ---
jest.mock('@dnd-kit/sortable', () => {
  return {
    __esModule: true,
    SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    arrayMove: (arr: unknown[]) => arr,
    sortableKeyboardCoordinates: jest.fn(),
    rectSortingStrategy: jest.fn(),
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
    }),
  };
});

import { render, screen, waitFor } from '@testing-library/react';
import MenuManagement from './MenuManagement';

// --------- API Mocks ---------
jest.mock('../api/store', () => ({
  getStoreInfo: jest.fn().mockResolvedValue({ id: 1 }),
}));

const mockGetCategories = jest.fn().mockResolvedValue([
  { id: 1, name: 'Cat A', order: 0, description: '', storeId: 1 },
  { id: 2, name: 'Cat B', order: 1, description: '', storeId: 1 },
]);

const mockReorderCategories = jest.fn().mockResolvedValue({ success: true });

jest.mock('../api/menu', () => ({
  getCategories: () => mockGetCategories(),
  reorderCategories: (payload: { items: { id: number; order: number }[] }) => mockReorderCategories(payload),
  deleteCategory: jest.fn(),
}));

// --------- Tests ---------

describe('MenuManagement ページ', () => {
  it('カテゴリ一覧をレンダリングし、ドラッグ＆ドロップで reorder API が呼ばれる', async () => {
    render(<MenuManagement />);

    // カテゴリが表示されるまで待機
    expect(await screen.findByText('Cat A')).toBeInTheDocument();

    // DndContext モックが自動で onDragEnd を呼ぶため、API が呼ばれたことを確認
    await waitFor(() => {
      expect(mockReorderCategories).toHaveBeenCalled();
    });
  });
}); 