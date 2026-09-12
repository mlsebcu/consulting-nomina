import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
 
export function Navbar() {
  const { usuario, logout } = useAuth();
 
  if (!usuario) return null;
 
  return (
    <nav style={{ display: 'flex', gap: 16, padding: 12, borderBottom: '1px solid #ccc' }}>
      <Link to="/empleados">Empleados</Link>
      <Link to="/departamentos">Departamentos</Link>
      <Link to="/nomina">Nómina</Link>
      <Link to="/reportes">Reportes</Link>
      <span style={{ marginLeft: 'auto' }}>
        {usuario.nombreUsuario} ({usuario.rol})
        <button onClick={logout} style={{ marginLeft: 8 }}>Salir</button>
      </span>
    </nav>
  );
}
 