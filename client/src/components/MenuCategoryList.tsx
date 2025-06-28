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
import DescriptionModal from './DescriptionModal';

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

  const [showDescription, setShowDescription] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    cursor: 'grab',
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
    touchAction: 'none' as const,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white rounded-lg shadow transition-all duration-100 ease-out ${isDragging ? 'shadow-md scale-[1.02]' : 'hover:shadow-sm'}`}
      >
        <div className="p-4 sm:p-5 md:p-6">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-1 truncate">
                {category.name}
              </h3>
              {category.description && (
                <p
                  className="text-gray-600 text-xs sm:text-sm truncate cursor-pointer"
                  onClick={() => setShowDescription(true)}
                  title={category.description}
                >
                  {category.description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 pl-2 shrink-0">
              <button
                onClick={() => onEdit(category)}
                className="px-3 py-1 text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="px-3 py-1 text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 rounded"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDescription && category.description && (
        <DescriptionModal
          description={category.description}
          title={category.name}
          onClose={() => setShowDescription(false)}
        />
      )}
    </>
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
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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