import React, { useEffect, useRef, useState } from "react";
import RichTextEditor from "react-rte";


interface TextEditorProps {
  markup: string;
  onChange: (value: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ markup, onChange }) => {
  const [value, setValue] = useState(RichTextEditor.createValueFromString(markup, "html"));

  const editorRef = useRef<HTMLDivElement | null>(null); 

  const handleChange = (newValue: any) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue.toString("html"));
    }
  };

  const toolbarConfig = {
    display: ["INLINE_STYLE_BUTTONS", "BLOCK_TYPE_BUTTONS", "HISTORY_BUTTONS"],
    INLINE_STYLE_BUTTONS: [
      { label: "Bold", style: "BOLD" },
      { label: "Italic", style: "ITALIC" },
      { label: "Strikethrough", style: "STRIKETHROUGH" },
    ],
    BLOCK_TYPE_BUTTONS: [
      { label: "UL", style: "unordered-list-item" },
      { label: "OL", style: "ordered-list-item" },
    ],
    HISTORY_BUTTONS: [
      { label: "Undo", style: "UNDO" },
      { label: "Redo", style: "REDO" },
    ],
  };

  useEffect(() => {
    if (editorRef.current) {
      const contentEditable = editorRef.current.querySelector('.DraftEditor-root') as HTMLElement; 
      if (contentEditable) {
        contentEditable.style.minHeight = '200px'; 
        contentEditable.style.maxHeight = '200px'; 
        contentEditable.style.overflowY = 'auto'; 
        
      }
    }
  }, [editorRef]);

  return (
    <div ref={editorRef}>
      <RichTextEditor
        value={value}
        onChange={handleChange}
        toolbarConfig={toolbarConfig}
      />
    </div>
  );
};

export default TextEditor;
