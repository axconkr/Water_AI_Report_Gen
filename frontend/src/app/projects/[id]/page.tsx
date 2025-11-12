'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import axios from '@/lib/axios'
import { useAuthStore } from '@/lib/store'
import FileUpload from '@/components/FileUpload'

interface Document {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  createdAt: string
}

interface Project {
  id: string
  name: string
  description: string | null
  projectType: string
  status: string
  targetDate: string | null
  createdAt: string
  updatedAt: string
  documents: Document[]
  _count: {
    documents: number
    generatedContents: number
  }
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { isAuthenticated } = useAuthStore()

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    fetchProject()
  }, [isAuthenticated, router, projectId])

  const fetchProject = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`/projects/${projectId}`)
      setProject(response.data.data.project)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '프로젝트를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) return

    try {
      await axios.delete(`/upload/${documentId}`)
      fetchProject()
    } catch (err: any) {
      alert(err.response?.data?.error?.message || '문서 삭제에 실패했습니다')
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('이 프로젝트를 삭제하시겠습니까? 모든 관련 데이터가 삭제됩니다.')) return

    try {
      await axios.delete(`/projects/${projectId}`)
      router.push('/projects')
    } catch (err: any) {
      alert(err.response?.data?.error?.message || '프로젝트 삭제에 실패했습니다')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { text: '초안', color: 'bg-gray-100 text-gray-800' },
      IN_PROGRESS: { text: '진행 중', color: 'bg-blue-100 text-blue-800' },
      REVIEW: { text: '검토 중', color: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { text: '완료', color: 'bg-green-100 text-green-800' },
      ARCHIVED: { text: '보관됨', color: 'bg-gray-100 text-gray-600' },
    }
    const badge = badges[status as keyof typeof badges] || badges.DRAFT
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">프로젝트를 찾을 수 없습니다</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link
            href="/projects"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
          >
            프로젝트 목록으로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{project.name}</h1>
                {getStatusBadge(project.status)}
              </div>
              {project.description && (
                <p className="mt-2 text-sm text-gray-600">{project.description}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <Link
                href="/projects"
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                목록
              </Link>
              <button
                onClick={handleDeleteProject}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Project Info */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 정보</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">프로젝트 유형</dt>
                  <dd className="mt-1 text-gray-900">{project.projectType}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">생성일</dt>
                  <dd className="mt-1 text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                  </dd>
                </div>
                {project.targetDate && (
                  <div>
                    <dt className="font-medium text-gray-500">목표 완료일</dt>
                    <dd className="mt-1 text-gray-900">
                      {new Date(project.targetDate).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-gray-500">업로드된 문서</dt>
                  <dd className="mt-1 text-gray-900">{project._count.documents}개</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">생성된 콘텐츠</dt>
                  <dd className="mt-1 text-gray-900">{project._count.generatedContents}개</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column - Documents */}
          <div className="lg:col-span-2">
            {/* AI Features Button */}
            <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">✨ AI 기능</h2>
                  <p className="text-blue-50 text-sm">
                    문서 분석, 콘텐츠 생성, AI 채팅으로 더 빠르고 정확한 보고서를 작성하세요
                  </p>
                </div>
                <Link
                  href={`/projects/${projectId}/ai`}
                  className="ml-4 rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-gray-50 transition-colors"
                >
                  AI 기능 사용하기 →
                </Link>
              </div>
            </div>

            {/* Upload Section */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">문서 업로드</h2>
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="text-sm font-medium text-primary hover:text-primary-600"
                >
                  {showUpload ? '닫기' : '파일 추가'}
                </button>
              </div>

              {showUpload && (
                <FileUpload
                  projectId={projectId}
                  onUploadSuccess={() => {
                    fetchProject()
                    setShowUpload(false)
                  }}
                />
              )}
            </div>

            {/* Documents List */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">업로드된 문서</h2>
              </div>

              {project.documents.length === 0 ? (
                <div className="p-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
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
                  <h3 className="mt-2 text-sm font-medium text-gray-900">문서가 없습니다</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    PDF 또는 DOCX 파일을 업로드하여 시작하세요
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {project.documents.map((doc) => (
                    <li key={doc.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                            <span className="text-xs font-semibold text-primary">
                              {doc.fileType}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.fileSize)} •{' '}
                              {new Date(doc.createdAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          삭제
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
