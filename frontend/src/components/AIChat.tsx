'use client'

import { useState, useRef, useEffect } from 'react'
import axios from '@/lib/axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIChatProps {
  projectId: string
}

export default function AIChat({ projectId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post('/content/chat', {
        projectId,
        message: input,
        conversationId,
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (response.data.data.conversationId) {
        setConversationId(response.data.data.conversationId)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'AI 응답 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewConversation = () => {
    setMessages([])
    setConversationId(null)
    setError('')
  }

  return (
    <div className="flex h-[600px] flex-col card animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">💬 AI 어시스턴트</h2>
          <p className="text-sm text-gray-600 mt-1">문서 작성에 대해 질문하세요</p>
        </div>
        {messages.length > 0 && (
          <button onClick={handleNewConversation} className="btn-secondary flex items-center">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            새 대화
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-4">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">대화를 시작하세요</h3>
              <p className="text-sm text-gray-600 mb-6">
                문서 작성, 내용 개선, 질문 등 무엇이든 물어보세요
              </p>
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-4 border border-blue-100">
                <p className="text-xs font-semibold text-gray-700 mb-3">💡 예시 질문:</p>
                <ul className="text-xs text-gray-600 space-y-2 text-left">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>&quot;이 프로젝트의 목표를 3가지로 요약해줘&quot;</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>&quot;사업 개요 섹션을 더 전문적으로 작성해줘&quot;</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>&quot;추진 일정표를 만들어줘&quot;</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex animate-slide-up ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-soft ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p
                className={`mt-2 text-xs flex items-center ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {message.timestamp.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-scale-in">
            <div className="max-w-[80%] rounded-2xl bg-white border border-gray-200 px-5 py-3 shadow-soft">
              <div className="flex space-x-1.5">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary animation-delay-200"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary animation-delay-400"></div>
              </div>
            </div>
          </div>
        )}

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

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요... (Shift+Enter: 줄바꿈, Enter: 전송)"
            rows={2}
            className="flex-1 resize-none input-field"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-primary btn-hover disabled:opacity-50 disabled:cursor-not-allowed h-fit self-end"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
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
          <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
            Enter
          </kbd>
          <span className="mx-1">전송</span>
          <span className="mx-1">•</span>
          <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
            Shift
          </kbd>
          <span className="mx-0.5">+</span>
          <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
            Enter
          </kbd>
          <span className="mx-1">줄바꿈</span>
        </p>
      </div>
    </div>
  )
}
