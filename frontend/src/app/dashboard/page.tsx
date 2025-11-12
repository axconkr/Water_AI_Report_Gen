'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import axios from '@/lib/axios'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  _count: {
    documents: number
    generatedContents: number
  }
  documents: Array<{
    fileName: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    } else {
      fetchProjects()
    }
  }, [isAuthenticated, router])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/projects')
      setProjects(response.data.data.projects)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  // Calculate statistics
  const totalProjects = projects.length

  // Count unique documents across all projects (same fileName = same document)
  const uniqueDocumentNames = new Set<string>()
  projects.forEach((project) => {
    project.documents?.forEach((doc) => {
      uniqueDocumentNames.add(doc.fileName)
    })
  })
  const totalUploadedDocs = uniqueDocumentNames.size

  const totalGeneratedDocs = projects.reduce(
    (sum, p) => sum + (p._count?.generatedContents || 0),
    0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 glass border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-1">APAS 대시보드</h1>
              <p className="text-sm text-gray-600">AI 기반 수행계획서 자동 작성 시스템</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}님</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  useAuthStore.getState().clearAuth()
                  router.push('/auth/login')
                }}
                className="btn-secondary"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="col-span-full animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">빠른 작업</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link href="/projects/new" className="card card-hover group">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4 group-hover:shadow-lg transition-shadow">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">새 프로젝트</span>
                  <span className="text-xs text-gray-500 mt-1">프로젝트 생성</span>
                </div>
              </Link>

              <Link href="/projects" className="card card-hover group">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white mb-4 group-hover:shadow-lg transition-shadow">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">내 프로젝트</span>
                  <span className="text-xs text-gray-500 mt-1">전체 프로젝트 보기</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="col-span-full animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 mb-6">통계</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="card group hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{totalProjects}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="card group hover:border-purple-200 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">업로드한 문서</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{totalUploadedDocs}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="card group hover:border-green-200 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI 생성 문서</p>
                    <p className="mt-2 text-3xl font-bold text-accent-600">{totalGeneratedDocs}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <svg
                      className="h-6 w-6 text-green-600"
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="col-span-full animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">최근 프로젝트</h2>
              <Link
                href="/projects"
                className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                전체 보기 →
              </Link>
            </div>

            {loading ? (
              <div className="card">
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="card">
                <div className="text-center py-16">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                    <svg
                      className="h-8 w-8 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">프로젝트가 없습니다</h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    새 프로젝트를 시작하여 AI 기반 수행계획서를 자동으로 작성해보세요.
                  </p>
                  <Link
                    href="/projects/new"
                    className="btn-primary btn-hover inline-flex items-center"
                  >
                    <svg className="-ml-0.5 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    새 프로젝트 시작하기
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 6).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="card card-hover group"
                  >
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <svg
                            className="h-4 w-4 mr-1"
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
                          {project._count.documents}개
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          {project._count.generatedContents}개
                        </span>
                      </div>
                      <span>{new Date(project.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
