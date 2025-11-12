'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from '@/lib/axios'
import { useAuthStore } from '@/lib/store'

interface Project {
  id: string
  name: string
  description: string | null
  projectType: string
  status: string
  targetDate: string | null
  createdAt: string
  _count: {
    documents: number
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    fetchProjects()
  }, [isAuthenticated, router, statusFilter])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const params = statusFilter !== 'ALL' ? { status: statusFilter } : {}
      const response = await axios.get('/projects', { params })
      setProjects(response.data.data.projects)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '프로젝트를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
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
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const getProjectTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      GENERAL: '일반',
      WATER_RESOURCE: '수자원',
      ENVIRONMENT: '환경',
      INFRASTRUCTURE: '인프라',
      RESEARCH: '연구',
    }
    return labels[type] || type
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">내 프로젝트</h1>
            <div className="flex space-x-3">
              <Link
                href="/dashboard"
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                대시보드
              </Link>
              <Link
                href="/projects/new"
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600"
              >
                새 프로젝트
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['ALL', 'DRAFT', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                }`}
              >
                {status === 'ALL' ? '전체' : getStatusBadge(status).props.children}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
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
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">프로젝트가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              새 프로젝트를 시작하여 수행계획서를 작성해보세요.
            </p>
            <div className="mt-6">
              <Link
                href="/projects/new"
                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600"
              >
                <svg
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                새 프로젝트
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group relative rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {getProjectTypeLabel(project.projectType)}
                    </p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>

                {project.description && (
                  <p className="mb-4 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg
                      className="mr-1 h-4 w-4"
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
                    {project._count.documents}개 문서
                  </div>
                  <div>
                    {new Date(project.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
