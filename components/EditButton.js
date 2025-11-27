// components/EditButton.js
'use client';

import { useState } from 'react';
import EditProductModal from './EditProductModal';

export default function EditButton({ product, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition text-sm mr-2"
      >
        Editar
      </button>
      {isOpen && (
        <EditProductModal
          product={product}
          onClose={() => setIsOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}