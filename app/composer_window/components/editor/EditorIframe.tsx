import React, { useRef, useState, useEffect, forwardRef, Ref } from 'react';
import { EditorType } from './types';
import { useHandler } from '../hooks/useHandler';
import { initEditor, getEditorRef, setEditorRef } from './editor.utils';

interface Props {
  id?: string;
  className?: string;
  defaultEmailData: string;
  onReady: () => void;
  onFocus: () => void;
  onInput: (value: string) => void;
}

const EditorIframe = (props: Props, ref: Ref<EditorType>) => {
  const { id, className, defaultEmailData, onReady, onInput } = props;

  const [iframeReady, setIframeReady] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleLoad = () => setIframeReady(true);

    const frameRef = iframeRef.current;
    const iframeDoc =
      frameRef?.contentDocument && iframeRef.current?.contentWindow?.document;

    if (iframeDoc?.readyState === 'complete') {
      handleLoad();
    }

    frameRef?.addEventListener('load', handleLoad);
    return () => frameRef?.removeEventListener('load', handleLoad);
  }, []);

  useEffect(() => {
    const init = async (iframeDoc: Document) => {
      try {
        const editor = await initEditor(iframeDoc, defaultEmailData);
        setEditorRef(ref, editor);
        setEditorReady(true);
        onReady();
      } catch (error) {
        console.log('The email editor failed to load', error);
      }
    };

    if (iframeReady && !editorReady) {
      const iframeDoc = iframeRef.current?.contentWindow?.document as Document;
      void init(iframeDoc);
    }
  }, [iframeReady, defaultEmailData, editorReady, onReady, ref]);

  const handleInput = useHandler(() => {
    const content = getEditorRef(ref).getHTML();
    console.log('THIS IS THE CONTENT', content);
    onInput(content);
  });

  useEffect(() => {
    if (editorReady) {
      const editor = getEditorRef(ref);

      // editor.addEventListener('focus', );
      editor.addEventListener('input', handleInput);
      // editor.addEventListener('willPaste', );
      // editor.addEventListener('cursor', );
      console.log('EMAIL DATA 2', defaultEmailData);

      return () => {
        // editor.removeEventListener('focus', );
        editor.removeEventListener('input', handleInput);
        // editor.removeEventListener('willPaste', );
        // editor.removeEventListener('cursor', );
      };
    }
  }, [editorReady, handleInput, ref]);

  return (
    <div className={`${className} w-full h-full bg-white`}>
          <iframe id={id} className="w-full h-full bg-white" title="Editor" ref={iframeRef} frameBorder="0" />
      />
    </div>
  );
};

export default forwardRef(EditorIframe);
