'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from '@/lib/axios'

interface GenerateForm {
  sectionTitle: string
  sectionDescription: string
}

interface GeneratedContent {
  id: string
  title: string
  content: string
  version: number
  createdAt: string
}

interface ContentGeneratorProps {
  projectId: string
  onContentGenerated?: () => void
}

export default function ContentGenerator({ projectId, onContentGenerated }: ContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GenerateForm>()

  const onSubmit = async (data: GenerateForm) => {
    try {
      setIsGenerating(true)
      setError('')
      setGeneratedContent(null)

      const response = await axios.post('/content/generate', {
        projectId,
        sectionTitle: data.sectionTitle,
        sectionDescription: data.sectionDescription,
      })

      setGeneratedContent(response.data.data.content)
      if (onContentGenerated) {
        onContentGenerated()
      }
      reset()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '문서 생성 중 오류가 발생했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (format: 'docx' | 'pdf' | 'txt') => {
    if (!generatedContent) return

    try {
      const response = await axios.get(`/content/${generatedContent.id}/download`, {
        params: { format },
        responseType: 'blob',
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      const extension = format
      const filename = `${generatedContent.title}.${extension}`
      link.setAttribute('download', filename)

      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Download error:', err)
      setError(err.response?.data?.error?.message || '문서 다운로드 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="card animate-fade-in">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">📝 계획서 / 보고서 초안 생성</h2>
        <p className="text-sm text-gray-600 mt-1">
          AI에 의한 전문적인 계획서 및 보고서 초안을 자동 생성합니다
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 animate-scale-in">
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

        <div>
          <label htmlFor="sectionTitle" className="block text-sm font-semibold text-gray-700 mb-2">
            섹션 제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="sectionTitle"
            type="text"
            placeholder="예: 1. 사업 개요"
            className="input-field"
            {...register('sectionTitle', {
              required: '섹션 제목을 입력해주세요',
            })}
          />
          {errors.sectionTitle && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.sectionTitle.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="sectionDescription"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            섹션 설명
          </label>
          <textarea
            id="sectionDescription"
            rows={3}
            placeholder="예: 사업의 배경과 목적, 추진 경과를 설명"
            className="input-field resize-none"
            {...register('sectionDescription')}
          />
          <p className="mt-2 text-xs text-gray-500 flex items-center">
            <svg
              className="h-3.5 w-3.5 text-gray-400 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            생성할 내용에 대한 간단한 설명을 입력하면 더 정확한 결과를 얻을 수 있습니다
          </p>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full btn-primary btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
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
              생성 중...
            </span>
          ) : (
            '📝 초안 생성'
          )}
        </button>
      </form>

      {isGenerating && !generatedContent && (
        <div className="mt-8 flex flex-col items-center justify-center py-12 animate-scale-in">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-purple-100"></div>
            <div className="absolute top-0 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
          <p className="mt-6 text-base font-medium text-gray-900">
            AI가 계획서 / 보고서 초안을 생성하고 있습니다
          </p>
          <p className="mt-2 text-sm text-gray-500">최대 1-2분 소요될 수 있습니다</p>
          <div className="mt-4 flex space-x-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary animation-delay-200"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary animation-delay-400"></div>
          </div>
        </div>
      )}

      {generatedContent && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <svg
                  className="h-5 w-5 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {generatedContent.title}
              </h3>
              <span className="badge bg-white text-primary border border-primary">
                v{generatedContent.version}
              </span>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-soft">
              <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {generatedContent.content}
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs text-gray-600">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              생성 일시: {new Date(generatedContent.createdAt).toLocaleString('ko-KR')}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-gray-900 flex items-center">
              <svg
                className="h-5 w-5 text-green-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              다운로드
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownload('docx')}
                className="btn-secondary btn-hover flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Word (.docx)
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                className="btn-secondary btn-hover flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                PDF (.pdf)
              </button>
              <button
                onClick={() => handleDownload('txt')}
                className="btn-secondary btn-hover flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                텍스트 (.txt)
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent.content)
                  alert('클립보드에 복사되었습니다')
                }}
                className="btn-secondary btn-hover flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                복사
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
