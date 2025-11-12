'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from '@/lib/axios'

interface FileUploadProps {
  projectId: string
  onUploadSuccess?: () => void
}

interface UploadFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function FileUpload({ projectId, onUploadSuccess }: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [error, setError] = useState('')

  const uploadFile = async (uploadFile: UploadFile, index: number) => {
    const file = uploadFile.file

    // Validate file type
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      setUploadFiles((prev) => {
        const newFiles = [...prev]
        newFiles[index] = {
          ...newFiles[index],
          status: 'error',
          error: 'PDF 또는 DOCX 파일만 가능합니다',
        }
        return newFiles
      })
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadFiles((prev) => {
        const newFiles = [...prev]
        newFiles[index] = {
          ...newFiles[index],
          status: 'error',
          error: '파일 크기는 10MB를 초과할 수 없습니다',
        }
        return newFiles
      })
      return
    }

    setUploadFiles((prev) => {
      const newFiles = [...prev]
      newFiles[index] = { ...newFiles[index], status: 'uploading' }
      return newFiles
    })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setUploadFiles((prev) => {
        const newFiles = [...prev]
        newFiles[index] = { ...newFiles[index], status: 'success', progress: 100 }
        return newFiles
      })
    } catch (err: any) {
      setUploadFiles((prev) => {
        const newFiles = [...prev]
        newFiles[index] = {
          ...newFiles[index],
          status: 'error',
          error: err.response?.data?.error?.message || '업로드 실패',
        }
        return newFiles
      })
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setError('')

      const newUploadFiles = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }))

      setUploadFiles(newUploadFiles)

      // Upload all files
      for (let i = 0; i < newUploadFiles.length; i++) {
        await uploadFile(newUploadFiles[i], i)
      }

      // Check if all succeeded
      setTimeout(() => {
        const allSuccess = uploadFiles.every((uf) => uf.status === 'success')
        if (allSuccess && onUploadSuccess) {
          onUploadSuccess()
        }
      }, 500)
    },
    [projectId, onUploadSuccess, uploadFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: true,
    disabled: uploadFiles.some((uf) => uf.status === 'uploading'),
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const isUploading = uploadFiles.some((uf) => uf.status === 'uploading')

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-primary bg-primary-50'
            : 'border-gray-300 bg-white hover:border-primary hover:bg-gray-50'
        } ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div>
            {isDragActive ? (
              <p className="text-sm text-primary font-medium">여기에 파일을 놓아주세요</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-primary hover:text-primary-600">
                    클릭하여 파일 선택
                  </span>{' '}
                  또는 드래그 앤 드롭
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOCX (최대 10MB) • 여러 파일 선택 가능
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {uploadFiles.length > 0 && (
        <div className="space-y-2">
          {uploadFiles.map((uploadFile, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <span className="text-xs font-semibold text-primary">
                    {uploadFile.file.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(uploadFile.file.size)}</p>
                </div>
              </div>
              <div className="ml-3">
                {uploadFile.status === 'uploading' && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                )}
                {uploadFile.status === 'success' && (
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
                )}
                {uploadFile.status === 'error' && (
                  <div className="flex items-center space-x-2">
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
                    {uploadFile.error && (
                      <span className="text-xs text-red-600">{uploadFile.error}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
