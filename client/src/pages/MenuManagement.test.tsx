import React from 'react';

// ===== API mock helpers =====
const mockGetCategories = jest.fn().mockResolvedValue([
  { id: 1, name: 'Cat A', order: 0, description: '', storeId: 1 },
  { id: 2, name: 'Cat B', order: 1, description: '', storeId: 1 },
]);

const mockReorderCategories = jest.fn().mockResolvedValue({ success: true });

// --- dnd-kit モック ---
jest.mock('@dnd-kit/core', () => {
  const ReactLocal = jest.requireActual('react');
  return {
    __esModule: true,
    DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: { active: { id: number }; over: { id: number } }) => void }) => {
      ReactLocal.useEffect(() => {
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

jest.mock('../api/menu', () => ({
  getCategories: () => mockGetCategories(),
  reorderCategories: (payload: { items: { id: number; order: number }[] }) => mockReorderCategories(payload),
  deleteCategory: jest.fn(),
}));

// --------- Tests ---------

describe('MenuManagement ページ', () => {
  it('ドラッグ＆ドロップで reorder API が呼ばれる', async () => {
    render(<MenuManagement />);
    expect(await screen.findByText('Cat A')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockReorderCategories).toHaveBeenCalled();
    });
  });
}); 