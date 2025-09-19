// Contenido para frontend/src/components/auth/ProtectedRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Este componente recibirá una prop 'adminOnly' para saber si es solo para administradores
function ProtectedRoute({ adminOnly = false }) {
  const { user } = useAuth(); // Leemos el usuario de nuestra pizarra mágica

  // CASO 1: La ruta requiere que seas admin, pero no lo eres o no has iniciado sesión.
  if (adminOnly && (!user || !user.is_admin)) {
    // Te redirigimos a la página principal.
    // Podríamos también redirigir a una página de "Acceso Denegado".
    return <Navigate to="/" replace />;
  }

  // CASO 2: La ruta requiere que inicies sesión, pero no lo has hecho.
  if (!adminOnly && !user) {
    // Te redirigimos a la página de login.
    // 'replace' evita que el usuario pueda volver a la página protegida con el botón de "atrás".
    return <Navigate to="/login" replace />;
  }

  // CASO 3: ¡Tienes permiso!
  // El componente <Outlet /> es un marcador de posición especial de React Router
  // que dice: "Renderiza aquí el componente hijo que corresponda a esta ruta".
  return <Outlet />;
}

export default ProtectedRoute;