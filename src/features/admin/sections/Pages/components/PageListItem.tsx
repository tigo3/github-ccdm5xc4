import React from 'react';
import { Page } from '../types'; // Assuming Page type is in ../types
import { Trash2, Edit, ArrowUp, ArrowDown } from 'lucide-react';

// --- Types ---
interface PageListItemProps {
  page: Page;
  index: number;
  pageCount: number;
  isLoading: boolean;
  onEdit: (page: Page) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

// --- PageListItem Component ---
const PageListItem: React.FC<PageListItemProps> = ({
  page,
  index,
  pageCount,
  isLoading,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  return (
    <li key={page.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        {/* Order Display (Optional but helpful) */}
        <span className="text-xs font-mono text-gray-400 w-6 text-right">{page.order}</span>
        {/* Page Info */}
        <div>
          <p className="font-medium text-gray-900">{page.title}</p>
          <p className="text-sm text-gray-500">/{page.slug}</p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        {/* Move Up Button */}
        <button
          onClick={() => onMoveUp(index)}
          disabled={isLoading || index === 0}
          className={`p-1 rounded ${isLoading || index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'}`}
          title="Move Up"
        >
          <ArrowUp size={18} />
        </button>
        {/* Move Down Button */}
        <button
          onClick={() => onMoveDown(index)}
          disabled={isLoading || index === pageCount - 1}
          className={`p-1 rounded ${isLoading || index === pageCount - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'}`}
          title="Move Down"
        >
          <ArrowDown size={18} />
        </button>
        {/* Edit Button */}
        <button
          onClick={() => onEdit(page)}
          disabled={isLoading}
          className="p-1 rounded text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
          title="Edit"
        >
          <Edit size={18} />
        </button>
        {/* Delete Button */}
        {page.id && (
          <button
            onClick={() => onDelete(page.id!)}
            disabled={isLoading}
            className="p-1 rounded text-gray-500 hover:text-red-600 hover:bg-red-100 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </li>
  );
};

export default PageListItem;