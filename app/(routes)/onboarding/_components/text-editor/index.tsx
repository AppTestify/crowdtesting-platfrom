import { MinimalTiptapEditor } from "@/app/_components/minimal-tiptap";
import { Textarea } from "@/components/ui/text-area";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
// import RichTextEditor from "react-rte";

interface TextEditorProps {
  markup: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({
  markup,
  onChange,
  placeholder,
}) => {
  const [value, setValue] = useState<string>();
  const [content, setContent] = React.useState(markup);

  React.useEffect(() => {
    setContent(markup);
  }, [markup]);

  React.useEffect(() => {
    setContent(markup);
  }, [markup]);

  const editorRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (newValue: any) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue.toString("html"));
    }
  };

  return (
    <div ref={editorRef}>
      <MinimalTiptapEditor
        throttleDelay={2000}
        className={cn("w-full rounded-lg min-h-[150px] bg-gray-50")}
        editorContentClassName="overflow-auto h-full"
        placeholder={placeholder || "Type your description here..."}
        editable={true}
        editorClassName="focus:outline-none px-5 py-4 h-full"
        value={content}
        onChange={(value) => {
          handleChange(value);
        }}
      />
    </div>
  );
};

export default TextEditor;
