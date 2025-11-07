// src/components/editor/tiptap-editor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  ImageIcon,
  LinkIcon,
  Loader2
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  placeholder?: string;
  editable?: boolean;
}

export function TiptapEditor({
  content,
  onChange,
  onImageUpload,
  placeholder = '本文を入力してください...',
  editable = true,
}: TiptapEditorProps) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    immediatelyRender: false, // SSR対応
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // 画像挿入
  const handleImageInsert = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;

      // ファイルサイズチェック (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('画像サイズは10MB以下にしてください。');
        return;
      }

      try {
        setUploading(true);
        const url = await onImageUpload(file);
        
        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error('画像アップロードエラー:', error);
        alert('画像のアップロードに失敗しました。');
      } finally {
        setUploading(false);
      }
    };

    input.click();
  }, [editor, onImageUpload]);

  // リンク挿入
  const handleLinkInsert = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('リンクURL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* ツールバー */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* テキストスタイル */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bold') ? 'bg-gray-300' : ''
          }`}
          title="太字"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('italic') ? 'bg-gray-300' : ''
          }`}
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* 見出し */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
          }`}
          title="見出し1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
          }`}
          title="見出し2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* リスト */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-gray-300' : ''
          }`}
          title="箇条書き"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-gray-300' : ''
          }`}
          title="番号付きリスト"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-gray-300' : ''
          }`}
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* 画像・リンク */}
        <button
          onClick={handleImageInsert}
          disabled={uploading}
          className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="画像を挿入"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={handleLinkInsert}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('link') ? 'bg-gray-300' : ''
          }`}
          title="リンクを挿入"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* 元に戻す・やり直す */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="元に戻す"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="やり直す"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* エディタ本体 */}
      <EditorContent editor={editor} />
    </div>
  );
}