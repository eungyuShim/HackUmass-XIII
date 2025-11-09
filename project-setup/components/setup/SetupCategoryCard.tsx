// SetupCategoryCard.tsx - Setup Modal 내 카테고리 카드
'use client';

import Image from 'next/image';
import { useSetupStore } from '@/app/stores/useSetupStore';

interface SetupCategoryCardProps {
  category: {
    id: number;
    name: string;
    weight: number;
    count: number;
  };
}

export default function SetupCategoryCard({ category }: SetupCategoryCardProps) {
  const updateSetupCategoryName = useSetupStore((state) => state.updateSetupCategoryName);
  const updateSetupCategoryWeight = useSetupStore((state) => state.updateSetupCategoryWeight);
  const updateSetupCategoryCount = useSetupStore((state) => state.updateSetupCategoryCount);
  const deleteSetupCategory = useSetupStore((state) => state.deleteSetupCategory);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSetupCategoryName(category.id, e.target.value);
  };
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = parseInt(e.target.value) || 0;
    updateSetupCategoryWeight(category.id, Math.max(0, Math.min(100, weight)));
  };
  
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 1;
    updateSetupCategoryCount(category.id, Math.max(1, count));
  };
  
  const handleDelete = () => {
    deleteSetupCategory(category.id);
  };
  
  return (
    <div className="setup-category-card">
      <div className="setup-category-header">
        <div className="setup-category-info">
          <input
            type="text"
            value={category.name}
            onChange={handleNameChange}
            className="setup-input-name"
            placeholder="Category name"
          />
          <div className="setup-category-count">
            Items:{' '}
            <input
              type="number"
              value={category.count}
              onChange={handleCountChange}
              min="1"
              className="setup-input-count"
            />
          </div>
        </div>
        
        <div className="setup-category-actions">
          <div className="setup-weight-badge">
            <input
              type="number"
              value={category.weight}
              onChange={handleWeightChange}
              min="0"
              max="100"
              className="setup-input-weight"
            />
            %
          </div>
          
          <button
            onClick={handleDelete}
            className="btn btn-small btn-icon btn-icon--danger"
            title="Delete category"
          >
            <Image
              src="/icons/trash.svg"
              alt="Delete"
              width={16}
              height={16}
              className="btn-icon-img"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
