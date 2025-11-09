// CategoryCard.tsx - 카테고리 카드 컴포넌트
'use client';

import { useState, useRef, useEffect } from 'react';
import { Category } from '@/app/types/dashboard';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import CategoryItem from './CategoryItem';
import Image from 'next/image';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const {
    updateCategoryName,
    updateCategoryWeight,
    deleteCategory,
    toggleCategoryItems,
    addItem,
    setEditingName,
    setEditingWeight,
  } = useCategoryStore();

  const [nameValue, setNameValue] = useState(category.name);
  const [weightValue, setWeightValue] = useState(category.weight.toString());
  const nameInputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (category._editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [category._editingName]);

  useEffect(() => {
    if (category._editingWeight && weightInputRef.current) {
      weightInputRef.current.focus();
      weightInputRef.current.select();
    }
  }, [category._editingWeight]);

  // Calculate current average
  const gradedItems = category.items.filter((item) => item.score !== null);
  const avg = gradedItems.length
    ? gradedItems.reduce((sum, item) => sum + (item.score || 0), 0) / gradedItems.length
    : 0;
  const avgText = gradedItems.length > 0 ? `Current Average: ${avg.toFixed(1)}%` : 'No grades yet';

  const handleNameDoubleClick = () => {
    setEditingName(category.id, true);
    setNameValue(category.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateCategoryName(category.id, nameValue);
    } else if (e.key === 'Escape') {
      setEditingName(category.id, false);
      setNameValue(category.name);
    }
  };

  const handleNameBlur = () => {
    if (nameValue.trim()) {
      updateCategoryName(category.id, nameValue);
    } else {
      setEditingName(category.id, false);
      setNameValue(category.name);
    }
  };

  const handleWeightDoubleClick = () => {
    setEditingWeight(category.id, true);
    setWeightValue(category.weight.toString());
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeightValue(e.target.value);
  };

  const handleWeightKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const weight = parseFloat(weightValue);
      if (!isNaN(weight) && weight >= 0 && weight <= 100) {
        updateCategoryWeight(category.id, weight);
      }
    } else if (e.key === 'Escape') {
      setEditingWeight(category.id, false);
      setWeightValue(category.weight.toString());
    }
  };

  const handleWeightBlur = () => {
    const weight = parseFloat(weightValue);
    if (!isNaN(weight) && weight >= 0 && weight <= 100) {
      updateCategoryWeight(category.id, weight);
    } else {
      setEditingWeight(category.id, false);
      setWeightValue(category.weight.toString());
    }
  };

  const handleToggleItems = () => {
    toggleCategoryItems(category.id);
  };

  const handleDelete = () => {
    deleteCategory(category.id);
  };

  const handleAddItem = () => {
    addItem(category.id);
  };

  return (
    <div className="category-card">
      {/* Category Header */}
      <div className="category-header">
        <div className="category-info">
          {/* Category Name */}
          {category._editingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={nameValue}
              onChange={handleNameChange}
              onKeyDown={handleNameKeyDown}
              onBlur={handleNameBlur}
              className="category-name-input"
              placeholder="Category name"
            />
          ) : (
            <span className="category-name" onDoubleClick={handleNameDoubleClick}>
              {category.name}
            </span>
          )}

          {/* Average */}
          <div className="category-average">{avgText}</div>
        </div>

        {/* Actions */}
        <div className="category-actions">
          {/* Weight */}
          {category._editingWeight ? (
            <div className="category-weight category-weight-editing">
              Weight:{' '}
              <input
                ref={weightInputRef}
                type="text"
                value={weightValue}
                onChange={handleWeightChange}
                onKeyDown={handleWeightKeyDown}
                onBlur={handleWeightBlur}
                className="category-weight-input"
                placeholder="0"
              />
              %
            </div>
          ) : (
            <div className="category-weight" onDoubleClick={handleWeightDoubleClick}>
              Weight: {category.weight}%
            </div>
          )}

          {/* Items Button */}
          <button
            onClick={handleToggleItems}
            className="btn btn-small btn-icon"
            title={`Items (${category.items.length})`}
          >
            <Image src="/icons/list.svg" alt="Items" width={20} height={20} className="btn-icon-img" />
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="btn btn-small btn-icon btn-icon--danger"
            title="Delete category"
          >
            <Image src="/icons/trash.svg" alt="Delete" width={20} height={20} className="btn-icon-img" />
          </button>
        </div>
      </div>

      {/* Items Container */}
      {category._open && (
        <div className="items-container">
          {/* Add Item Button */}
          <div className="item-add-wrapper">
            <button onClick={handleAddItem} className="btn btn--primary btn-small">
              + Add Item
            </button>
          </div>

          {/* Items List */}
          {category.items.map((item, index) => (
            <CategoryItem key={index} item={item} categoryId={category.id} itemIndex={index} />
          ))}
        </div>
      )}
    </div>
  );
}
