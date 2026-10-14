import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function isTokenValid(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // No token or invalid/expired token → clear and redirect to login
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
