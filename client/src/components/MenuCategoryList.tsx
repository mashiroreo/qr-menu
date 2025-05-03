import React, { useEffect, useState } from 'react';
import { MenuCategory } from '../types/menu';
import { getCategories, deleteCategory, reorderCategories } from '../api/menu';
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

interface MenuCategoryListProps {
  onEdit: (category: MenuCategory) => void;
  refreshTrigger?: number;
}

interface SortableCategoryProps {
  category: MenuCategory;
  onEdit: (category: MenuCategory) => void;
  onDelete: (id: number) => void;
}

const SortableCategory: React.FC<SortableCategoryProps> = ({ category, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: category.id,
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
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-100 ease-out
        ${isDragging ? 'shadow-md scale-[1.02] translate-x-0 translate-y-0' : ''}`}
    >
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-gray-600 mb-4">{category.description}</p>
        )}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onEdit(category)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            編集
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuCategoryList: React.FC<MenuCategoryListProps> = ({ onEdit, refreshTrigger }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setError(null);
    } catch (err) {
      setError('カテゴリーの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('このカテゴリーを削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteCategory(id);
      await fetchCategories();
    } catch (err) {
      setError('カテゴリーの削除に失敗しました');
      console.error(err);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!event.active || !event.over) return;

    const oldIndex = categories.findIndex((cat) => cat.id === event.active.id);
    const newIndex = categories.findIndex((cat) => cat.id === event.over?.id);

    if (oldIndex === -1 || newIndex === -1) {
      console.log('Invalid indices:', { oldIndex, newIndex });
      return;
    }

    // 先にUIを更新
    const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
    setCategories(reorderedCategories);

    // APIリクエストを非同期で実行
    const reorderData = {
      items: reorderedCategories.map((cat, index) => ({
        id: Number(cat.id),
        order: index
      }))
    };
    console.log('Sending reorder data:', reorderData);

    try {
      await reorderCategories(reorderData);
      // 成功時は既にUIが更新済みなので、再取得は不要
      toast.success('並び順を更新しました');
    } catch (error: any) {
      // エラー時のみ元の順序に戻す
      setCategories(categories);
      console.error('並び替えエラー:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SortableContext
          items={categories.map(cat => cat.id)}
          strategy={rectSortingStrategy}
        >
          {categories.map((category) => (
            <SortableCategory
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </div>
      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          カテゴリーがありません。新規追加ボタンからカテゴリーを作成してください。
        </div>
      )}
    </DndContext>
  );
};

export default MenuCategoryList; 