"use client";

import React, { useState } from "react";
import { Card } from "./ui/Card";
import { Checkbox } from "./ui/Checkbox";
import { Brief } from "@/lib/types";

interface VerifyChecklistProps {
  items: Brief["what_to_verify"];
  onItemToggle?: (id: string, checked: boolean) => void;
}

export const VerifyChecklist: React.FC<VerifyChecklistProps> = ({
  items,
  onItemToggle,
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
    onItemToggle?.(id, !checkedItems.has(id));
  };

  const completedCount = checkedItems.size;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          What to Verify
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-neutral-600">
            {completedCount}/{items.length}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} variant="default">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={checkedItems.has(item.id)}
                onChange={() => handleToggle(item.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    checkedItems.has(item.id)
                      ? "line-through text-neutral-500"
                      : "text-neutral-900"
                  }`}
                >
                  {item.text}
                </p>
                {item.source && (
                  <a
                    href={item.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:text-accent-dark underline block mt-1 break-all"
                  >
                    {item.source}
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
