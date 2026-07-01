"use client";
import React, { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<any>;
  itemType: string;
}

export default function DeleteButton({ id, action, itemType }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
      startTransition(async () => {
        try {
          const res = await action(id);
          if (res && res.error) {
            toast.error(res.error);
          }
        } catch (e: any) {
          toast.error(`Failed to delete: ${e.message}`);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--danger, #ef4444)',
        cursor: isPending ? 'not-allowed' : 'pointer',
        padding: '4px',
        opacity: isPending ? 0.5 : 1
      }}
      title={`Delete ${itemType}`}
    >
      <Trash2 size={16} />
    </button>
  );
}
