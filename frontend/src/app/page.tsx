export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-sans text-sm lg:flex">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            APAS
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            AI 기반 외부용역과제 수행계획서 자동 작성 시스템
          </p>
          <div className="flex gap-4 justify-center">
            <a
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium transition-colors hover:bg-gray-100"
              href="/auth/login"
            >
              로그인
            </a>
            <a
              className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              href="/auth/register"
            >
              회원가입
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
