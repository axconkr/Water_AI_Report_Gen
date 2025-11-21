import mammoth from 'mammoth'
import PDFParser from 'pdf2json'

export interface ParsedDocument {
  text: string
  metadata: {
    pages?: number
    wordCount: number
    charCount: number
  }
}

/**
 * Parse PDF file and extract text content using pdf2json
 */
export const parsePDF = async (buffer: Buffer): Promise<ParsedDocument> => {
  return parsePDFWithPdf2json(buffer)
}

/**
 * Parse PDF file using pdf2json (fallback method)
 */
const parsePDFWithPdf2json = async (buffer: Buffer): Promise<ParsedDocument> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1)

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('pdf2json error:', errData)
      reject(new Error(`PDF 파싱 오류: ${errData?.parserError || 'Unknown error'}`))
    })

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        // Extract text from all pages
        let text = ''
        const pages = pdfData?.Pages || []

        for (const page of pages) {
          const texts = page?.Texts || []
          for (const textItem of texts) {
            try {
              if (textItem?.R && textItem.R.length > 0 && textItem.R[0]?.T) {
                const decodedText = decodeURIComponent(textItem.R[0].T)
                text += decodedText + ' '
              }
            } catch (decodeError) {
              console.warn('Text decode error:', decodeError)
              // Continue with next text item
            }
          }
          text += '\n'
        }

        if (!text || text.trim().length === 0) {
          reject(new Error('PDF에서 텍스트를 추출할 수 없습니다. 이미지 기반 PDF일 수 있습니다.'))
          return
        }

        resolve({
          text: text.trim(),
          metadata: {
            pages: pages.length,
            wordCount: text.split(/\s+/).filter((w) => w.length > 0).length,
            charCount: text.length,
          },
        })
      } catch (error: any) {
        console.error('PDF data processing error:', error)
        reject(new Error(`PDF 데이터 처리 중 오류: ${error.message}`))
      }
    })

    // Parse the buffer
    try {
      pdfParser.parseBuffer(buffer)
    } catch (parseError: any) {
      console.error('PDF buffer parse error:', parseError)
      reject(new Error(`PDF 버퍼 파싱 오류: ${parseError.message}`))
    }
  })
}

/**
 * Parse DOCX file and extract text content
 */
export const parseDOCX = async (buffer: Buffer): Promise<ParsedDocument> => {
  try {
    const result = await mammoth.extractRawText({ buffer })

    return {
      text: result.value,
      metadata: {
        wordCount: result.value.split(/\s+/).length,
        charCount: result.value.length,
      },
    }
  } catch (error) {
    throw new Error('DOCX 파일 파싱 중 오류가 발생했습니다')
  }
}

/**
 * Parse document based on file type
 */
export const parseDocument = async (buffer: Buffer, mimetype: string): Promise<ParsedDocument> => {
  if (mimetype === 'application/pdf') {
    return parsePDF(buffer)
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    return parseDOCX(buffer)
  } else {
    throw new Error('지원하지 않는 파일 형식입니다')
  }
}
