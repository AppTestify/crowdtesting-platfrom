import { MinimalTiptapEditor } from "@/app/_components/minimal-tiptap";
import { Textarea } from "@/components/ui/text-area";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { HelpCircle, Type, Bold, Italic, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const [showExamples, setShowExamples] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  React.useEffect(() => {
    setContent(markup);
    // Calculate word count
    const text = markup.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [markup]);

  const editorRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (newValue: any) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue.toString("html"));
    }
  };

  const exampleTemplates = [
    {
      title: "E-commerce Testing",
      content: `<h3>E-commerce Website Testing Project</h3>
<p>This project focuses on comprehensive testing of our e-commerce platform to ensure optimal user experience and functionality.</p>
<h4>Key Testing Areas:</h4>
<ul>
<li>User registration and login functionality</li>
<li>Product catalog browsing and search</li>
<li>Shopping cart operations</li>
<li>Checkout process and payment integration</li>
<li>Order management and tracking</li>
</ul>
<h4>Expected Outcomes:</h4>
<p>Deliver a bug-free, user-friendly shopping experience that increases conversion rates and customer satisfaction.</p>`
    },
    {
      title: "Mobile App Testing",
      content: `<h3>Mobile Application Testing Initiative</h3>
<p>Comprehensive testing of our mobile application across multiple devices and operating systems.</p>
<h4>Testing Scope:</h4>
<ul>
<li>Cross-platform compatibility (iOS/Android)</li>
<li>Performance optimization</li>
<li>User interface consistency</li>
<li>Push notifications functionality</li>
<li>Offline mode capabilities</li>
</ul>
<h4>Success Criteria:</h4>
<p>Achieve 99.9% crash-free sessions and maintain 4.5+ app store ratings.</p>`
    },
    {
      title: "API Testing",
      content: `<h3>API Integration Testing Project</h3>
<p>Ensuring robust and reliable API endpoints for seamless third-party integrations.</p>
<h4>Testing Focus:</h4>
<ul>
<li>RESTful API endpoint validation</li>
<li>Data integrity and security</li>
<li>Performance under load</li>
<li>Error handling and response codes</li>
<li>Authentication and authorization</li>
</ul>
<h4>Deliverables:</h4>
<p>Comprehensive API documentation and automated test suites for continuous integration.</p>`
    }
  ];

  const insertTemplate = (template: typeof exampleTemplates[0]) => {
    setContent(template.content);
    onChange(template.content);
    setShowExamples(false);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Type className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Rich Text Editor</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Use the editor to format your project description. You can add headings, lists, and emphasis to make it more readable.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500">
              {wordCount} words
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowExamples(!showExamples)}
              className="text-xs"
            >
              {showExamples ? "Hide" : "Show"} Examples
            </Button>
          </div>
        </div>

        {/* Example Templates */}
        {showExamples && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="md:col-span-3 mb-2">
              <h4 className="font-semibold text-blue-900 mb-1">Quick Start Templates</h4>
              <p className="text-sm text-blue-700">Click any template to use it as a starting point for your project description.</p>
            </div>
            {exampleTemplates.map((template, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded-lg border border-blue-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-200"
                onClick={() => insertTemplate(template)}
              >
                <h5 className="font-medium text-gray-900 mb-1">{template.title}</h5>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {template.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Editor */}
        <div ref={editorRef} className="relative">
          <MinimalTiptapEditor
            throttleDelay={2000}
            className={cn(
              "w-full rounded-xl min-h-[200px] bg-white border-2 border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all duration-200 shadow-sm hover:shadow-md"
            )}
            editorContentClassName="overflow-auto h-full prose prose-sm max-w-none"
            placeholder={placeholder || "Write a detailed description of your project goals, scope, and requirements..."}
            editable={true}
            editorClassName="focus:outline-none px-6 py-4 h-full text-gray-900 leading-relaxed"
            value={content}
            onChange={(value) => {
              handleChange(value);
            }}
          />
          
          {/* Editor Footer */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Bold className="w-3 h-3" />
                <span>Bold</span>
              </div>
              <div className="flex items-center space-x-1">
                <Italic className="w-3 h-3" />
                <span>Italic</span>
              </div>
              <div className="flex items-center space-x-1">
                <List className="w-3 h-3" />
                <span>Lists</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {content.length > 0 ? "Looking good!" : "Start typing your description..."}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center">
            <HelpCircle className="w-4 h-4 mr-2" />
            Writing Tips
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Include your testing objectives and expected outcomes</li>
            <li>• Mention the platforms, devices, or systems you'll be testing</li>
            <li>• Specify any special requirements or constraints</li>
            <li>• Add timeline expectations and key milestones</li>
          </ul>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TextEditor;
