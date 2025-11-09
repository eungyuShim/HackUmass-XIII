// CategoryItem.tsx - 개별 카테고리 아이템 컴포넌트
'use client';

import { useState, useRef, useEffect } from 'react';
import { CategoryItem as CategoryItemType } from '@/app/types/dashboard';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import Image from 'next/image';

interface CategoryItemProps {
  item: CategoryItemType;
  categoryId: number;
  itemIndex: number;
}

export default function CategoryItem({ item, categoryId, itemIndex }: CategoryItemProps) {
  const { updateItemName, updateItemScore, deleteItem, setEditingItemName, setEditingItemScore } =
    useCategoryStore();
  const [nameValue, setNameValue] = useState(item.name);
  const [scoreValue, setScoreValue] = useState(item.score?.toString() || '');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const scoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item._editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [item._editingName]);

  useEffect(() => {
    if (item._editingScore && scoreInputRef.current) {
      scoreInputRef.current.focus();
      scoreInputRef.current.select();
    }
  }, [item._editingScore]);

  const handleNameDoubleClick = () => {
    setEditingItemName(categoryId, itemIndex, true);
    setNameValue(item.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateItemName(categoryId, itemIndex, nameValue);
    } else if (e.key === 'Escape') {
      setEditingItemName(categoryId, itemIndex, false);
      setNameValue(item.name);
    }
  };

  const handleNameBlur = () => {
    if (nameValue.trim()) {
      updateItemName(categoryId, itemIndex, nameValue);
    } else {
      setEditingItemName(categoryId, itemIndex, false);
      setNameValue(item.name);
    }
  };

  const handleScoreDoubleClick = () => {
    setEditingItemScore(categoryId, itemIndex, true);
    setScoreValue(item.score?.toString() || '');
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScoreValue(e.target.value);
  };

  const handleScoreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const score = scoreValue.trim() === '' ? null : parseFloat(scoreValue);
      if (score === null || (!isNaN(score) && score >= 0 && score <= 100)) {
        updateItemScore(categoryId, itemIndex, score);
      }
    } else if (e.key === 'Escape') {
      setEditingItemScore(categoryId, itemIndex, false);
      setScoreValue(item.score?.toString() || '');
    }
  };

  const handleScoreBlur = () => {
    const score = scoreValue.trim() === '' ? null : parseFloat(scoreValue);
    if (score === null || (!isNaN(score) && score >= 0 && score <= 100)) {
      updateItemScore(categoryId, itemIndex, score);
    } else {
      setEditingItemScore(categoryId, itemIndex, false);
      setScoreValue(item.score?.toString() || '');
    }
  };

  const handleDelete = () => {
    deleteItem(categoryId, itemIndex);
  };

  return (
    <div className="item-card">
      {/* Item Name */}
      {item._editingName ? (
        <input
          ref={nameInputRef}
          type="text"
          value={nameValue}
          onChange={handleNameChange}
          onKeyDown={handleNameKeyDown}
          onBlur={handleNameBlur}
          className="item-name-input"
          placeholder="Item name"
        />
      ) : (
        <div className="item-name" onDoubleClick={handleNameDoubleClick}>
          {item.name}
        </div>
      )}

      {/* Item Score */}
      {item._editingScore ? (
        <input
          ref={scoreInputRef}
          type="text"
          value={scoreValue}
          onChange={handleScoreChange}
          onKeyDown={handleScoreKeyDown}
          onBlur={handleScoreBlur}
          className="item-score-input"
        />
      ) : (
        <div className="item-score" onDoubleClick={handleScoreDoubleClick}>
          {item.score !== null ? `${item.score}%` : 'Not graded'}
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="btn btn-small btn-icon btn-icon--danger item-delete-btn"
        title="Delete item"
      >
        <Image src="/icons/trash.svg" alt="Delete" width={20} height={20} className="btn-icon-img" />
      </button>
    </div>
  );
}
