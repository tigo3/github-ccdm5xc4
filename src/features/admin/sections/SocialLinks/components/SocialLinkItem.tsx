import React from 'react';
import { SocialLink } from '../types'; // Corrected path
import { iconComponents } from '../constants/socialLinkConstants'; // Corrected path
import { Trash2, Edit, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';

interface SocialLinkItemProps {
  link: SocialLink;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (link: SocialLink) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

const SocialLinkItem: React.FC<SocialLinkItemProps> = ({
  link,
  index,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const IconComponent = iconComponents[link.icon] || HelpCircle; // Get icon component or fallback

  return (
    <div
      // Fully adjusted styles for light theme
      className="bg-white border border-gray-200 rounded-lg shadow p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center md:bg-transparent md:hover:bg-gray-50 md:shadow-none md:rounded-none md:border-b md:border-gray-200 md:last:border-b-0 md:py-3 md:px-3 transition-colors duration-150"
    >
      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <IconComponent size={20} className="text-gray-500 flex-shrink-0" />
            <span className="font-semibold text-lg text-gray-800 truncate">{link.name}</span>
          </div>
          <span className="text-sm text-gray-500 flex-shrink-0">(Order: {link.order})</span>
        </div>
        <div className="text-sm break-words">
          <span className="font-medium text-gray-500">URL: </span>
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link.url}</a>
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 mt-3">
          {/* Action Buttons - Mobile - Adjusted for light theme */}
          <button onClick={() => onMoveUp(index)} disabled={isFirst} className={`p-1 rounded ${isFirst ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-blue-600 hover:text-blue-500 hover:bg-gray-100'}`} title="Move Up"><ArrowUp size={18} /></button>
          <button onClick={() => onMoveDown(index)} disabled={isLast} className={`p-1 rounded ${isLast ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-blue-600 hover:text-blue-500 hover:bg-gray-100'}`} title="Move Down"><ArrowDown size={18} /></button>
          <button onClick={() => onEdit(link)} className="text-yellow-500 hover:text-yellow-400 hover:bg-gray-100 p-1 rounded" title="Edit"><Edit size={18} /></button>
          <button onClick={() => onDelete(link.id)} className="text-red-600 hover:text-red-500 hover:bg-gray-100 p-1 rounded" title="Delete"><Trash2 size={18} /></button>
        </div>
      </div>

      {/* Desktop Table-like Layout */}
      <div className="hidden md:contents"> {/* Use md:contents for grid layout */}
        <div className="col-span-1 text-center text-gray-700">{link.order}</div>
        <div className="col-span-1 flex items-center justify-center">
          <IconComponent size={20} className="text-gray-500" />
        </div>
        <div className="col-span-3 truncate pr-2 text-gray-800">{link.name}</div>
        <div className="col-span-4 truncate pr-2">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link.url}</a>
        </div>
        <div className="col-span-3 flex items-center justify-end gap-1 pr-2"> {/* Added padding */}
          {/* Action Buttons - Desktop */}
          {/* Action Buttons - Desktop - Adjusted for light theme */}
          <button
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            className={`p-1 rounded ${isFirst ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-blue-600 hover:text-blue-500 hover:bg-gray-100'}`}
            title="Move Up"
          >
            <ArrowUp size={18} />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            className={`p-1 rounded ${isLast ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-blue-600 hover:text-blue-500 hover:bg-gray-100'}`}
            title="Move Down"
          >
            <ArrowDown size={18} />
          </button>
          <button onClick={() => onEdit(link)} className="text-yellow-500 hover:text-yellow-400 hover:bg-gray-100 p-1 rounded" title="Edit">
            <Edit size={18} />
          </button>
          <button onClick={() => onDelete(link.id)} className="text-red-600 hover:text-red-500 hover:bg-gray-100 p-1 rounded" title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialLinkItem;