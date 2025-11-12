'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import axios from '@/lib/axios'
import Link from 'next/link'

interface ProjectForm {
  name: string
  description: string
  projectType: string
  customProjectType?: string
  targetDate: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('WATER_RESOURCE')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectForm>()

  const onSubmit = async (data: ProjectForm) => {
    setIsLoading(true)
    setError('')

    try {
      // 기타 선택 시 customProjectType 사용
      const projectData = {
        ...data,
        projectType:
          data.projectType === 'CUSTOM' ? data.customProjectType || 'CUSTOM' : data.projectType,
      }

      const response = await axios.post('/projects', projectData)
      const projectId = response.data.data.project.id

      router.push(`/projects/${projectId}`)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '프로젝트 생성에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 glass border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">새 프로젝트 생성</h1>
              <p className="text-sm text-gray-600 mt-1">AI 기반 수행계획서 작성을 시작합니다</p>
            </div>
            <Link href="/dashboard" className="btn-secondary">
              취소
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="card animate-fade-in">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  프로젝트 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className="input-field"
                  placeholder="예: 2024년 하천 수질 개선 사업"
                  {...register('name', {
                    required: '프로젝트 이름을 입력해주세요',
                    minLength: {
                      value: 2,
                      message: '프로젝트 이름은 최소 2자 이상이어야 합니다',
                    },
                  })}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  프로젝트 설명
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="input-field resize-none"
                  placeholder="프로젝트에 대한 간단한 설명을 입력해주세요"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="projectType"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  프로젝트 유형
                </label>
                <select
                  id="projectType"
                  className="input-field"
                  {...register('projectType')}
                  onChange={(e) => setSelectedType(e.target.value)}
                  defaultValue="WATER_RESOURCE"
                >
                  <optgroup label="수자원 관련">
                    <option value="WATER_RESOURCE">수자원 기본계획</option>
                    <option value="WATER_SUPPLY">수도정비 기본계획</option>
                    <option value="SEWERAGE">하수도정비 기본계획</option>
                    <option value="RIVER_MANAGEMENT">하천관리계획</option>
                    <option value="FLOOD_CONTROL">홍수방어 계획</option>
                    <option value="WATERSHED">유역종합치수계획</option>
                  </optgroup>
                  <optgroup label="환경 관련">
                    <option value="ENVIRONMENT">환경영향평가</option>
                    <option value="WATER_QUALITY">수질개선 사업</option>
                    <option value="ECOSYSTEM">생태하천 복원</option>
                  </optgroup>
                  <optgroup label="인프라 관련">
                    <option value="INFRASTRUCTURE">인프라 건설</option>
                    <option value="FACILITY_MANAGEMENT">시설물 관리</option>
                    <option value="SMART_CITY">스마트시티</option>
                  </optgroup>
                  <optgroup label="기타">
                    <option value="RESEARCH">연구 과제</option>
                    <option value="GENERAL">일반 사업</option>
                    <option value="CUSTOM">기타 (직접 입력)</option>
                  </optgroup>
                </select>
              </div>

              {selectedType === 'CUSTOM' && (
                <div className="animate-slide-down">
                  <label
                    htmlFor="customProjectType"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    프로젝트 유형 (직접 입력) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="customProjectType"
                    type="text"
                    className="input-field"
                    placeholder="예: 스마트 물관리 체계 구축"
                    {...register('customProjectType', {
                      required: selectedType === 'CUSTOM' ? '프로젝트 유형을 입력해주세요' : false,
                    })}
                  />
                  {errors.customProjectType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.customProjectType.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="targetDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  목표 완료일
                </label>
                <input
                  id="targetDate"
                  type="date"
                  className="input-field"
                  {...register('targetDate')}
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
                  프로젝트 완료 예정일을 선택하세요 (선택사항)
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <Link href="/dashboard" className="btn-secondary">
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
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
                    <span className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      프로젝트 생성
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
