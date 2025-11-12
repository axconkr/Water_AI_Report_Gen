import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx'
import PDFDocument from 'pdfkit'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

interface ExportOptions {
  title: string
  content: string
  format: 'docx' | 'pdf' | 'txt'
}

/**
 * Parse markdown content and convert to structured format
 */
function parseMarkdown(content: string) {
  const lines = content.split('\n')
  const elements: Array<{ type: string; text: string; level?: number }> = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      elements.push({ type: 'paragraph', text: '' })
      continue
    }

    // Headers
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,6})\s+(.+)/)
      if (match) {
        elements.push({
          type: 'heading',
          level: match[1].length,
          text: match[2],
        })
        continue
      }
    }

    // Bold text
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push({
        type: 'bold',
        text: trimmed.slice(2, -2),
      })
      continue
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.match(/^\d+\.\s/)) {
      elements.push({
        type: 'list',
        text: trimmed.replace(/^[-\d+\.]\s+/, ''),
      })
      continue
    }

    // Regular paragraph
    elements.push({
      type: 'paragraph',
      text: trimmed,
    })
  }

  return elements
}

/**
 * Export content as DOCX
 */
export async function exportAsDocx(options: ExportOptions): Promise<Buffer> {
  const { title, content } = options
  const elements = parseMarkdown(content)

  const children: Paragraph[] = []

  // Add title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  )

  // Add content
  for (const element of elements) {
    switch (element.type) {
      case 'heading':
        const headingLevel =
          element.level === 1
            ? HeadingLevel.HEADING_1
            : element.level === 2
              ? HeadingLevel.HEADING_2
              : element.level === 3
                ? HeadingLevel.HEADING_3
                : HeadingLevel.HEADING_4

        children.push(
          new Paragraph({
            text: element.text,
            heading: headingLevel,
            spacing: { before: 240, after: 120 },
          })
        )
        break

      case 'bold':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.text,
                bold: true,
              }),
            ],
            spacing: { after: 120 },
          })
        )
        break

      case 'list':
        children.push(
          new Paragraph({
            text: `• ${element.text}`,
            spacing: { after: 60 },
            indent: { left: 360 },
          })
        )
        break

      case 'paragraph':
        if (element.text) {
          children.push(
            new Paragraph({
              text: element.text,
              spacing: { after: 120 },
            })
          )
        } else {
          children.push(new Paragraph({ text: '' }))
        }
        break
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

/**
 * Export content as PDF
 */
export async function exportAsPdf(options: ExportOptions): Promise<Buffer> {
  const { title, content } = options

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Register Korean font with multiple fallbacks
    let fontRegistered = false
    const fontPaths = [
      '/Library/Fonts/NanumGothic.ttf',
      '/System/Library/Fonts/AppleSDGothicNeo.ttc',
      '/System/Library/Fonts/Supplemental/AppleGothic.ttf',
    ]

    for (const fontPath of fontPaths) {
      try {
        doc.registerFont('KoreanFont', fontPath)
        doc.font('KoreanFont')
        fontRegistered = true
        break
      } catch (error) {
        // Try next font path
        continue
      }
    }

    if (!fontRegistered) {
      console.warn('Warning: Korean font not found. Text may not display correctly.')
    }

    // Add title
    doc.fontSize(20).text(title, { align: 'center' })
    doc.moveDown(2)

    // Parse and add content
    const elements = parseMarkdown(content)

    for (const element of elements) {
      switch (element.type) {
        case 'heading':
          const fontSize = 18 - (element.level || 1) * 2
          doc.fontSize(fontSize).text(element.text, { continued: false })
          doc.moveDown(0.5)
          break

        case 'bold':
          doc.fontSize(12).text(element.text, { continued: false })
          doc.moveDown(0.3)
          break

        case 'list':
          doc.fontSize(12).text(`• ${element.text}`, {
            indent: 20,
            continued: false,
          })
          doc.moveDown(0.2)
          break

        case 'paragraph':
          if (element.text) {
            doc.fontSize(12).text(element.text, { continued: false })
            doc.moveDown(0.3)
          } else {
            doc.moveDown(0.5)
          }
          break
      }
    }

    doc.end()
  })
}

/**
 * Export content as plain text
 */
export function exportAsTxt(options: ExportOptions): Buffer {
  const { title, content } = options
  const text = `${title}\n${'='.repeat(title.length)}\n\n${content}`
  return Buffer.from(text, 'utf-8')
}
