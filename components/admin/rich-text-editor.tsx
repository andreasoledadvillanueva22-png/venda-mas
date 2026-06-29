'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import DOMPurify from 'dompurify'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  MAX_PRODUCT_DESCRIPTION_HTML_LENGTH,
  stripHtmlToPlainText,
} from '@/lib/product-description'

type EditorMode = 'visual' | 'html' | 'preview'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
}

const FONT_FAMILIES = [
  { label: 'Predeterminada', value: '' },
  { label: 'Sans-serif', value: 'Inter, Arial, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace', value: 'ui-monospace, SFMono-Regular, monospace' },
]

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? 'secondary' : 'ghost'}
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="shrink-0"
    >
      {children}
    </Button>
  )
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Describe el producto con sus beneficios y usos',
  maxLength = MAX_PRODUCT_DESCRIPTION_HTML_LENGTH,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<EditorMode>('visual')
  const [htmlValue, setHtmlValue] = useState(value)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontFamily,
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[220px] px-3 py-3 focus:outline-none [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-red-600 [&_a]:underline [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg',
        'aria-label': 'Editor de descripción del producto',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML()
      const normalized = html === '<p></p>' ? '' : html
      setHtmlValue(normalized)
      onChange(normalized)
    },
  })

  useEffect(() => {
    if (!editor) {
      return
    }

    const currentHtml = editor.getHTML()
    const normalizedCurrent = currentHtml === '<p></p>' ? '' : currentHtml

    if (value !== normalizedCurrent) {
      editor.commands.setContent(value || '', { emitUpdate: false })
      setHtmlValue(value || '')
    }
  }, [editor, value])

  useEffect(() => {
    if (!editor) {
      return
    }

    editor.setEditable(!disabled && mode === 'visual')
  }, [disabled, editor, mode])

  const sanitizedPreview = useMemo(
    () =>
      DOMPurify.sanitize(htmlValue, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'b',
          'em',
          'i',
          'u',
          's',
          'h1',
          'h2',
          'h3',
          'ul',
          'ol',
          'li',
          'a',
          'img',
          'blockquote',
          'span',
          'div',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'style', 'class'],
      }),
    [htmlValue],
  )

  const characterCount = htmlValue.length
  const plainTextPreview = stripHtmlToPlainText(htmlValue)

  const applyHtmlModeValue = useCallback(
    (nextHtml: string) => {
      const trimmed = nextHtml.trim()
      const normalized = trimmed === '<p></p>' ? '' : trimmed
      setHtmlValue(normalized)
      onChange(normalized)
      editor?.commands.setContent(normalized || '', { emitUpdate: false })
    },
    [editor, onChange],
  )

  const setEditorMode = (nextMode: EditorMode) => {
    if (nextMode === mode) {
      return
    }

    if (mode === 'html' && editor) {
      applyHtmlModeValue(htmlValue)
    }

    if (nextMode === 'html' && editor) {
      setHtmlValue(editor.getHTML() === '<p></p>' ? '' : editor.getHTML())
    }

    setMode(nextMode)
  }

  const insertLink = () => {
    if (!editor) {
      return
    }

    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL del enlace', previousUrl ?? 'https://')

    if (url === null) {
      return
    }

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  const insertImage = () => {
    if (!editor) {
      return
    }

    const url = window.prompt('URL de la imagen', 'https://')

    if (!url?.trim()) {
      return
    }

    editor.chain().focus().setImage({ src: url.trim() }).run()
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'visual' as const, label: 'Editor' },
            { id: 'html' as const, label: 'HTML' },
            { id: 'preview' as const, label: 'Preview' },
          ] satisfies Array<{ id: EditorMode; label: string }>
        ).map((tab) => (
          <Button
            key={tab.id}
            type="button"
            size="sm"
            variant={mode === tab.id ? 'secondary' : 'outline'}
            disabled={disabled}
            onClick={() => setEditorMode(tab.id)}
          >
            {tab.id === 'html' ? (
              <Code2 className="mr-1.5 h-4 w-4" />
            ) : tab.id === 'preview' ? (
              <Eye className="mr-1.5 h-4 w-4" />
            ) : null}
            {tab.label}
          </Button>
        ))}
      </div>

      {mode === 'visual' && editor ? (
        <div className="overflow-hidden rounded-lg border border-input bg-background">
          <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-2">
            <ToolbarButton
              label="Negrita"
              active={editor.isActive('bold')}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Cursiva"
              active={editor.isActive('italic')}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Subrayado"
              active={editor.isActive('underline')}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>

            <span className="mx-1 hidden h-6 w-px bg-border sm:inline" />

            <ToolbarButton
              label="Título H1"
              active={editor.isActive('heading', { level: 1 })}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Título H2"
              active={editor.isActive('heading', { level: 2 })}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Título H3"
              active={editor.isActive('heading', { level: 3 })}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Párrafo"
              active={editor.isActive('paragraph')}
              disabled={disabled}
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              <Pilcrow className="h-4 w-4" />
            </ToolbarButton>

            <span className="mx-1 hidden h-6 w-px bg-border sm:inline" />

            <ToolbarButton
              label="Alinear a la izquierda"
              active={editor.isActive({ textAlign: 'left' })}
              disabled={disabled}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Centrar"
              active={editor.isActive({ textAlign: 'center' })}
              disabled={disabled}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Alinear a la derecha"
              active={editor.isActive({ textAlign: 'right' })}
              disabled={disabled}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Justificar"
              active={editor.isActive({ textAlign: 'justify' })}
              disabled={disabled}
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            >
              <AlignJustify className="h-4 w-4" />
            </ToolbarButton>

            <span className="mx-1 hidden h-6 w-px bg-border sm:inline" />

            <ToolbarButton
              label="Lista con viñetas"
              active={editor.isActive('bulletList')}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Lista numerada"
              active={editor.isActive('orderedList')}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>

            <span className="mx-1 hidden h-6 w-px bg-border sm:inline" />

            <ToolbarButton label="Insertar enlace" disabled={disabled} onClick={insertLink}>
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Insertar imagen" disabled={disabled} onClick={insertImage}>
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>

            <select
              aria-label="Familia tipográfica"
              disabled={disabled}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs"
              value={editor.getAttributes('textStyle').fontFamily ?? ''}
              onChange={(event) => {
                const family = event.target.value
                if (!family) {
                  editor.chain().focus().unsetFontFamily().run()
                  return
                }
                editor.chain().focus().setFontFamily(family).run()
              }}
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.label} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>

            <input
              type="color"
              aria-label="Color del texto"
              disabled={disabled}
              className="h-7 w-10 cursor-pointer rounded-md border border-input bg-background p-0.5"
              value={(editor.getAttributes('textStyle').color as string | undefined) ?? '#111827'}
              onChange={(event) => {
                editor.chain().focus().setColor(event.target.value).run()
              }}
            />
          </div>

          <EditorContent editor={editor} />
          {!plainTextPreview && (
            <p className="pointer-events-none -mt-[220px] px-3 py-3 text-sm text-muted-foreground">
              {placeholder}
            </p>
          )}
        </div>
      ) : null}

      {mode === 'html' ? (
        <textarea
          value={htmlValue}
          disabled={disabled}
          onChange={(event) => {
            const nextValue = event.target.value
            if (nextValue.length > maxLength) {
              return
            }
            setHtmlValue(nextValue)
            onChange(nextValue)
          }}
          onBlur={() => applyHtmlModeValue(htmlValue)}
          className={cn(
            'min-h-[280px] w-full rounded-lg border border-input bg-slate-950 px-3 py-3 font-mono text-xs text-slate-100 outline-none transition',
            'focus-visible:border-ring focus-visible:ring-ring/50',
          )}
          spellCheck={false}
        />
      ) : null}

      {mode === 'preview' ? (
        <div className="min-h-[280px] rounded-lg border border-input bg-white px-4 py-4">
          {sanitizedPreview ? (
            <div
              className="product-description text-sm text-muted-foreground [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-red-600 [&_a]:underline [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: sanitizedPreview }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{placeholder}</p>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {characterCount}/{maxLength} caracteres HTML
        </span>
        {plainTextPreview ? (
          <span>{plainTextPreview.length} caracteres de texto visible</span>
        ) : null}
      </div>
    </div>
  )
}
