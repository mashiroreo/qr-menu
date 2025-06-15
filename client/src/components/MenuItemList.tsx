import React, { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types/menu';
import { getMenuItems, deleteMenuItem, reorderMenuItems } from '../api/menu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'react-hot-toast';

interface MenuItemListProps {
  storeId: number;
  categoryId: number;
  onEdit: (item: MenuItem) => void;
  refreshTrigger?: number;
}

interface SortableMenuItemProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}

const SortableMenuItem: React.FC<SortableMenuItemProps> = ({ item, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: item.id,
    animateLayoutChanges: () => false
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    cursor: 'grab',
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
    touchAction: 'none' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`border rounded-lg p-4 transition-all duration-100 ease-out bg-white
        ${isDragging ? 'shadow-md scale-[1.02] translate-x-0 translate-y-0' : 'hover:shadow-sm'}`}
    >
      {item.imageUrl && (
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-48 object-cover rounded-md"
            draggable={false}
          />
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
      {item.description && (
        <p className="text-gray-600 mb-2">{item.description}</p>
      )}
      <p className="text-lg font-bold mb-4">¥{item.price.toLocaleString()}</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onEdit(item)}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          編集
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          削除
        </button>
      </div>
    </div>
  );
};

const MenuItemList: React.FC<MenuItemListProps> = ({
  storeId: _storeId,
  categoryId,
  onEdit,
  refreshTrigger = 0,
}) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8ピクセル以上動かさないとドラッグを開始しない
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMenuItems(categoryId);
      setItems(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setError(null);
    } catch (err) {
      setError('メニューアイテムの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // 初回および依存配列が変化した際にメニューアイテムを取得
  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshTrigger]);

  useEffect(() => {}, [_storeId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('このメニューアイテムを削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteMenuItem(id);
      await fetchItems();
    } catch (err) {
      setError('メニューアイテムの削除に失敗しました');
      console.error(err);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!event.active || !event.over) return;

    const oldIndex = items.findIndex((item) => item.id === event.active.id);
    const newIndex = items.findIndex((item) => item.id === event.over?.id);

    if (oldIndex === -1 || newIndex === -1) {
      console.log('Invalid indices:', { oldIndex, newIndex, active: event.active.id, over: event.over.id });
      return;
    }

    // 先にUIを更新
    const reorderedItems = arrayMove(items, oldIndex, newIndex);
    setItems(reorderedItems);

    // APIリクエストを非同期で実行
    const reorderData = {
      items: reorderedItems.map((item, index) => ({
        id: Number(item.id),
        order: index
      }))
    };

    try {
      await reorderMenuItems(reorderData);
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      // エラー時は元の順序に戻す
      setItems(items);
      console.error('並び替えエラー:', {
        error,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      if (error.response) {
        console.error('Error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      toast.error(`並び順の更新に失敗しました: ${error.response?.data?.error || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        メニューアイテムがありません
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SortableContext
          items={items.map(item => item.id)}
          strategy={rectSortingStrategy}
        >
          {items.map((item) => (
            <SortableMenuItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default MenuItemList; 