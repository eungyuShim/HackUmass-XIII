"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Category {
  id: string;
  name: string;
  weight: number;
  average: number;
  items: any[];
}

interface CategoryRowProps {
  category: Category;
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
}

function CategoryRow({ category, onUpdate, onDelete }: CategoryRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editWeight, setEditWeight] = useState(category.weight.toString());

  const handleNameSave = () => {
    setIsEditingName(false);
    onUpdate({ ...category, name: editName });
  };

  const handleWeightSave = () => {
    setIsEditingWeight(false);
    const weight = parseFloat(editWeight) || 0;
    onUpdate({ ...category, weight });
  };

  return (
    <div className="bg-white border border-[var(--border-light)] rounded-xl p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--accent-light)] transition-all">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
              className="font-semibold text-base text-[var(--txt)] px-1 py-0.5 rounded bg-[var(--bg-gray)] border-none outline-none w-full max-w-[300px]"
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="font-semibold text-base text-[var(--txt)] cursor-pointer px-1 py-0.5 rounded hover:bg-[var(--bg-gray)] inline-block"
            >
              {category.name}
            </div>
          )}

          <div className="text-[13px] text-[var(--txt-muted)] mt-0.5 px-1 font-medium">
            Average: {category.average.toFixed(1)}%
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditingWeight ? (
            <div className="flex items-center gap-1 bg-white border-2 border-[var(--accent)] rounded-md px-2 py-1">
              <input
                type="number"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                onBlur={handleWeightSave}
                onKeyDown={(e) => e.key === "Enter" && handleWeightSave()}
                className="w-12 text-center text-[13px] font-semibold border-none outline-none"
                autoFocus
              />
              <span className="text-[13px] font-semibold">%</span>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingWeight(true)}
              className="flex items-center gap-1 bg-[var(--bg-gray)] border border-[var(--border-light)] rounded-md px-2.5 py-1 cursor-pointer hover:bg-[var(--accent-light)] hover:text-white hover:border-[var(--accent-light)] transition-colors"
            >
              <span className="text-[13px] font-semibold">
                {category.weight}%
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(category.id)}
            className="h-8 w-8 text-[var(--txt-muted)] hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CategoryTableProps {
  categories: Category[];
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryTable({
  categories,
  onUpdate,
  onDelete,
}: CategoryTableProps) {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
