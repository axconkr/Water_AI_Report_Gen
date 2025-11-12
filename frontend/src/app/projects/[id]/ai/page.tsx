'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import axios from '@/lib/axios'
import { useAuthStore } from '@/lib/store'
import DocumentAnalysis from '@/components/DocumentAnalysis'
import ContentGenerator from '@/components/ContentGenerator'
import AIChat from '@/components/AIChat'

interface Document {
  id: string
  name: string
  fileType: string
}

interface Project {
  id: string
  name: string
  documents: Document[]
}

export default function ProjectAIPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { isAuthenticated } = useAuthStore()

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'analysis' | 'generate' | 'chat'>('analysis')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

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
      const projectData = response.data.data.project
      setProject(projectData)

      // 첫 번째 문서를 자동 선택
      if (projectData.documents.length > 0) {
        setSelectedDocument(projectData.documents[0])
      }
    } catch (err: any) {
      setError('프로젝트를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
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

  const tabs = [
    { id: 'analysis', name: '문서 분석', icon: '🔍' },
    { id: 'generate', name: '초안 생성', icon: '📝' },
    { id: 'chat', name: 'AI 채팅', icon: '💬' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI 기능</h1>
              <p className="mt-1 text-sm text-gray-600">{project.name}</p>
            </div>
            <Link
              href={`/projects/${projectId}`}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              프로젝트로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.icon} {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'analysis' && <DocumentAnalysis projectId={projectId} />}

          {activeTab === 'generate' && <ContentGenerator projectId={projectId} />}

          {activeTab === 'chat' && <AIChat projectId={projectId} />}
        </div>
      </main>
    </div>
  )
}
