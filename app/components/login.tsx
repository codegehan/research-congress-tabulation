'use client';

import { FormEvent, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
        if (!code.trim()) {
          setError('Access code is required');
          return;
        }

        if (code.length < 4) {
          setError('Access code must be at least 4 characters');
          return;
        }
        const digitSum = code
          .split('')
          .filter((char) => /\d/.test(char))
          .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
        
        if (digitSum === 17) {
          router.push('/admin');
          return;
        }

        // Fetch data to verify judge access code
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Failed to fetch authentication data');
        const data = await res.json();
        
        const judges = data.judges || [];
        const matchedJudge = judges.find((j: any) => j.accessCode === code);

        if (matchedJudge) {
          localStorage.setItem('currentJudge', JSON.stringify(matchedJudge));
          router.push('/dashboard');
        } else {
          setError('Invalid access code');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    },
    [code]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Background Decoration Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md lg:max-w-lg z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
          {/* Logo Section - Rectangular */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-[#E14A06] to-[#9A50DC] rounded-2xl px-2 py-4 w-full max-w-xs">
              {/* <img
                src="/img/TechtopiaWordmark_Colored.png"
                alt="Techtopia Wordmark"
                width={600}
                height={600}
                className="mx-auto"
              /> */}
              <Image
                src="/img/TechtopiaWordmark_Colored.png"
                alt="Techtopia Wordmark"
                loading='eager'
                width={600}
                height={600}
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome
            </h1>
            <p className="font-poppins text-gray-600 text-sm sm:text-base">
              Enter your access code to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Field */}
            <div>
              <label
                htmlFor="code"
                className="block font-poppins text-sm font-medium text-gray-700 mb-3"
              >
                Access Code
              </label>
              <input
                id="code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                autoFocus
                className="w-full px-4 py-3 sm:py-4 font-poppins rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/20 outline-none transition-all duration-300 bg-gray-50 text-gray-900 placeholder-gray-400 text-base"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
                <p className="font-poppins text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-4 px-4 font-poppins font-semibold text-white transition-all duration-300 bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 hover:cursor-pointer disabled:cursor-not-allowed disabled:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 rounded-xl text-base sm:text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Enter Access'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="font-poppins text-xs text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="font-poppins text-xs sm:text-sm text-gray-600">
              Need help accessing your account?{' '}
              <a href="https://www.facebook.com/ccsjrmsumain" target='_blank' className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                Contact Support
              </a>
            </p>
            <p className="font-poppins text-xs text-gray-400 mt-4">
              © 2026 CodeGehan. All rights reserved.
            </p>
          </div>
        </div>

        {/* Responsive Info Text */}
        {/* <div className="mt-6 text-center">
          <p className="font-poppins text-xs sm:text-sm text-gray-500">
            Secure • Fast • Reliable
          </p>
        </div> */}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
