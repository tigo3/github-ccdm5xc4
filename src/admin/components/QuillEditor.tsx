import React, { useMemo, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content here...",
  style = { minHeight: '200px' },
  className = "mt-1 bg-white"
}) => {
  const quillRef = useRef<ReactQuill>(null);

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

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      ref={quillRef}
      modules={modules}
      formats={formats}
      className={className}
      placeholder={placeholder}
      style={style}
    />
  );
};

export default QuillEditor;
