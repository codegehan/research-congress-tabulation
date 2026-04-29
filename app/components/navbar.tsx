import { faSignOutAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
interface NavBarProps {
  currentUser: { name: string; email: string };
}
const NavBar = memo(({ currentUser }: NavBarProps) => 
  {
    const router = useRouter();
    const handleLogout = useCallback(async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error('Logout failed');
        }
        localStorage.clear();
        sessionStorage.clear();
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
        localStorage.clear();
        sessionStorage.clear();
        router.push('/');
      }
    }, [router]);

    return (
  <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <Image
            src="/img/TechtopiaWordmark_Colored.png"
            alt="Techtopia Wordmark"
            width={150}
            height={150}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
              <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <p className="font-poppins text-sm font-semibold text-gray-900">
                {currentUser.name}
              </p>
              <p className="font-poppins text-xs text-gray-600">
                {currentUser.email}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors font-poppins text-sm font-medium hover:shadow-md"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
    );
  }
);
NavBar.displayName = 'NavBar';
export default NavBar;