/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import ExampleTheme from './exampleTheme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';


const editorConfig = {
    namespace: 'React.js Demo',
    nodes: [],
    onError(error: Error) {
        throw error;
    },
    theme: ExampleTheme,
};

export default function RichEditor() {
    return (
        <div className="w-full mx-auto bg-white rounded-lg h-40 p-3">
            <LexicalComposer initialConfig={editorConfig}>
                <RichTextPlugin
                    contentEditable={<ContentEditable className='focus:outline-none' />}
                    placeholder={<div>Enter some text...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                {/* <ToolbarPlugin /> */}
                <AutoFocusPlugin />
                <HistoryPlugin />
            </LexicalComposer>
        </div>
    );
}
