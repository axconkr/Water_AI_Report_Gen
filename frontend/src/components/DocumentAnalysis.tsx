'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'

interface Document {
  id: string
  fileName: string
  fileType: string
  fileSize: number
}

interface AnalysisResult {
  documentId: string
  fileName: string
  success: boolean
  analysis?: any
  error?: string
}

interface DocumentAnalysisProps {
  projectId: string
}

export default function DocumentAnalysis({ projectId }: DocumentAnalysisProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [error, setError] = useState('')
  const [currentAnalyzing, setCurrentAnalyzing] = useState<string>('')
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    fetchDocuments()
  }, [projectId])

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`/upload/${projectId}`)
      setDocuments(response.data.data.documents || [])
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    }
  }

  const handleAnalyzeAll = async () => {
    if (documents.length === 0) {
      setError('분석할 문서가 없습니다. 먼저 문서를 업로드해주세요.')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setAnalysisResults([])
    setProgress({ current: 0, total: documents.length })

    const results: AnalysisResult[] = []

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i]
      setCurrentAnalyzing(doc.fileName)
      setProgress({ current: i + 1, total: documents.length })

      try {
        const response = await axios.post(`/analysis/documents/${doc.id}`)
        results.push({
          documentId: doc.id,
          fileName: doc.fileName,
          analysis: response.data.data.analysis,
          success: true,
        })
      } catch (err: any) {
        results.push({
          documentId: doc.id,
          fileName: doc.fileName,
          error: err.response?.data?.error?.message || '분석 실패',
          success: false,
        })
      }

      setAnalysisResults([...results])
    }

    setCurrentAnalyzing('')
    setIsAnalyzing(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="card animate-fade-in">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">🔍 AI 문서 분석</h2>
            <p className="text-sm text-gray-600 mt-1">업로드된 모든 문서를 AI로 분석합니다</p>
          </div>
          <button
            onClick={handleAnalyzeAll}
            disabled={isAnalyzing || documents.length === 0}
            className="btn-primary btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <span className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                분석 중... ({progress.current}/{progress.total})
              </span>
            ) : (
              '모든 문서 분석'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 animate-scale-in">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* 문서 목록 */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          업로드된 문서 ({documents.length}개)
        </h3>
        {documents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">업로드된 문서가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                    <span className="text-xs font-semibold text-primary">{doc.fileType}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                  </div>
                </div>
                {currentAnalyzing === doc.fileName && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="text-xs text-primary font-medium">분석 중...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 분석 진행 중 */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-12 animate-scale-in">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-100"></div>
            <div className="absolute top-0 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
          <p className="mt-6 text-base font-medium text-gray-900">AI가 문서를 분석하고 있습니다</p>
          <p className="mt-2 text-sm text-gray-500">
            {currentAnalyzing && `현재: ${currentAnalyzing}`}
          </p>
          <div className="mt-4 w-64">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-center text-gray-600">
              {progress.current} / {progress.total} 문서 완료
            </p>
          </div>
        </div>
      )}

      {/* 분석 결과 */}
      {analysisResults.length > 0 && !isAnalyzing && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-base font-semibold text-gray-900">분석 결과</h3>
          {analysisResults.map((result) => (
            <div
              key={result.documentId}
              className={`rounded-lg border p-4 ${
                result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {result.success ? (
                      <svg
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <p className="text-sm font-medium text-gray-900">{result.fileName}</p>
                  </div>

                  {result.success && result.analysis ? (
                    <div className="space-y-3 ml-7">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">문서 유형</p>
                        <p className="text-sm text-gray-900">{result.analysis.analysisType}</p>
                      </div>

                      {result.analysis.keywords && result.analysis.keywords.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">주요 키워드</p>
                          <div className="flex flex-wrap gap-1">
                            {result.analysis.keywords
                              .slice(0, 5)
                              .map((keyword: string, index: number) => (
                                <span
                                  key={index}
                                  className="badge bg-white text-gray-700 border border-gray-200 text-xs"
                                >
                                  {keyword}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {result.analysis.extractedInfo?.summary && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">요약</p>
                          <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                            {result.analysis.extractedInfo.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-700 ml-7">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                성공:{' '}
                <span className="font-semibold text-green-600">
                  {analysisResults.filter((r) => r.success).length}
                </span>
                {' / '}
                실패:{' '}
                <span className="font-semibold text-red-600">
                  {analysisResults.filter((r) => !r.success).length}
                </span>
              </span>
              <button
                onClick={() => setAnalysisResults([])}
                className="text-gray-500 hover:text-gray-700"
              >
                결과 지우기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
