import React, { useMemo, useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { Maximize2, Minimize2 } from 'lucide-react'; // Import icons for slider

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

const MIN_HEIGHT = 100; // Minimum editor height in pixels
const MAX_HEIGHT = 800; // Maximum editor height in pixels
const DEFAULT_HEIGHT = 200; // Default editor height in pixels

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content here...",
  style = {}, // Remove default minHeight from here, controlled by state now
  className = "mt-1" // Remove bg-white, applied directly to editor below
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [editorHeight, setEditorHeight] = useState(DEFAULT_HEIGHT);

  // --- Prevent page jump on picker click ---
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    const toolbar = editor?.getModule('toolbar')?.container;

    if (!toolbar) return;

    let scrollYBeforeClick = 0;

    const handleToolbarMouseDown = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      if (targetElement.closest('.ql-picker')) {
        scrollYBeforeClick = window.scrollY;
      }
    };

    const handleToolbarMouseUp = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      if (targetElement.closest('.ql-picker')) {
        setTimeout(() => {
          if (window.scrollY !== scrollYBeforeClick) {
            window.scrollTo(window.scrollX, scrollYBeforeClick);
          }
        }, 0);
      }
    };

    toolbar.addEventListener('mousedown', handleToolbarMouseDown);
    toolbar.addEventListener('mouseup', handleToolbarMouseUp);

    return () => {
      toolbar.removeEventListener('mousedown', handleToolbarMouseDown);
      toolbar.removeEventListener('mouseup', handleToolbarMouseUp);
    };
  }, []); // Run once on mount

  // Define Quill Modules & Formats INSIDE the component using useMemo
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: function() { // Use 'function' to access Quill instance via 'this' if needed, or stick to ref
          const quill = quillRef.current?.getEditor();
          if (!quill) {
            console.error("Quill editor instance not found.");
            return;
          }

          const range = quill.getSelection(true);
          if (!range) return;

          const tooltip = (quill as any).theme.tooltip;
          const originalSave = tooltip.save;
          const originalAction = tooltip.action;

          tooltip.edit();

          const input = tooltip.textbox as HTMLInputElement;
          if (!input) {
              console.error("Tooltip input element not found.");
              tooltip.hide();
              return;
          }

          input.value = '';
          input.setAttribute('placeholder', 'Enter image URL');
          input.setAttribute('data-mode', 'image');

          const saveHandler = () => {
            const url = input.value;
            if (url) {
              quill.insertEmbed(range.index, 'image', url, 'user');
              tooltip.hide();
            } else {
              tooltip.hide();
            }
            tooltip.save = originalSave;
            tooltip.action = originalAction;
            input.removeEventListener('keydown', keydownHandler);
            tooltip.root.querySelector('a.ql-action')?.removeEventListener('click', saveHandler);
          };

          const keydownHandler = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              saveHandler();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              tooltip.hide();
              tooltip.save = originalSave;
              tooltip.action = originalAction;
              input.removeEventListener('keydown', keydownHandler);
              tooltip.root.querySelector('a.ql-action')?.removeEventListener('click', saveHandler);
            }
          };

          tooltip.save = saveHandler;

          input.removeEventListener('keydown', keydownHandler);
          input.addEventListener('keydown', keydownHandler);

          const saveButton = tooltip.root.querySelector('a.ql-action');
          if (saveButton) {
            saveButton.removeEventListener('click', saveHandler);
            saveButton.addEventListener('click', saveHandler);
          } else {
            console.warn("Tooltip save button (a.ql-action) not found.");
          }

          input.focus();
        }
      }
    }
  }), []);

  const formats = useMemo(() => [
    'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block', 'list', 'bullet', 'script', 'indent',
    'direction', 'align', 'color', 'background', 'link', 'image', 'video'
  ], []);

  // Note: For optimal mobile toolbar layout, global CSS might be needed if the toolbar overflows, e.g.:
  // .ql-toolbar { flex-wrap: wrap; padding: 4px; } /* Allow toolbar items to wrap */
  // .ql-snow .ql-formats { margin-right: 8px !important; margin-bottom: 4px; } /* Adjust spacing when wrapped */

  return (
    <div className={`quill-editor-container ${className}`}>
      {/* Wrapper div controls the height */}
      <div
        className="quill-editor-wrapper border border-gray-300 rounded-md overflow-hidden" // Add border and rounding here
        style={{ ...style, height: `${editorHeight}px`, display: 'flex', flexDirection: 'column' }} // Apply dynamic height, use flex column
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          ref={quillRef}
          modules={modules}
          formats={formats}
          className="bg-white flex-grow" // Use flex-grow to fill height
          placeholder={placeholder}
          style={{ height: 'calc(100% - 42px)' }} // Adjust height calculation based on toolbar height (approx 42px)
        />
      </div>
      {/* Height Adjustment Slider */}
      <div className="flex items-center space-x-2 mt-2 text-gray-600">
        <Minimize2 size={16} />
        <input
          type="range"
          min={MIN_HEIGHT}
          max={MAX_HEIGHT}
          value={editorHeight}
          onChange={(e) => setEditorHeight(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          aria-label="Adjust editor height"
        />
        <Maximize2 size={16} />
        <span className="text-xs w-12 text-right">{editorHeight}px</span>
      </div>
    </div>
  );
};

export default QuillEditor;
