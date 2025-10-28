import { Link, Route, Router } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { HealthPage } from './pages/HealthPage';
import UserManagementPage from './pages/UserManagementPage';
import { FileBrowserPage } from './pages/FileBrowserPage';
import ConfigurationPage from './pages/ConfigurationPage';
import { NavLink } from './components/NavLink';
import { useState, useRef, useEffect } from 'react';
import { Menu, MenuItem } from './components/Menu';
import { NotificationProvider, NotificationContainer, useNotifications } from './components/notifications';
import LogsPage from './pages/LogsPage';
import { FileText, LogOut, Settings, Users, UserLock } from 'lucide-react';
import { PermissionManagementPage } from './pages/PermissionManagementPage';
import RolesPage from './pages/RolesPage';
import { SharedLinksPage } from './pages/SharedLinksPage';
import PublicSharedFilePage from './pages/PublicSharedFilePage';

function AppContent() {
  const { state, logout } = useAuth();
  const { notifications, removeNotification } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-100">Loading...</p>
        </div>
      </div>
    );
  }


  // Allow public shared file route to bypass authentication
  const isPublicSharedRoute = window.location.pathname.startsWith('/public/shared/');
  if (!state.isAuthenticated && !isPublicSharedRoute) {
    return (
      <div className="min-h-screen bg-gray-900">
        <LoginPage />
      </div>
    );
  }

  console.log(state)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 px-5">
        <div className="flex items-center h-15">
          <NavLink href="/">
            <span className="text-2xl font-bold text-gray-100">
              NAS Cloud
            </span>
          </NavLink>

          {/* Show navigation links only when authenticated */}
          {state.isAuthenticated && (
            <div className="flex gap-5 ml-10">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/browser">File Browser</NavLink>
            </div>
          )}

          {/* User info and menu */}
          <div className="ml-auto flex items-center gap-4">
            {state.isAuthenticated ? (
              <>
                <span className="text-sm text-gray-400">
                  Welcome, <span className="font-medium text-gray-100">{state.user?.username}</span>
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-900 text-blue-200 rounded-full">
                    {typeof state.user?.role === 'object' && state.user.role ? state.user.role.display_name : 'User'}
                  </span>
                </span>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={toggleMenu}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-md transition-colors"
                  >
                    Menu
                  </button>
                  {menuOpen && (
                    <Menu>
                      {state.user?.role && typeof state.user.role === 'object' && state.user.role.permissions?.includes('admin') && (
                          <>
                            <MenuItem href="/users" icon={<Users className="w-4 h-4 mr-2" />}>Manage Users</MenuItem>
                            <MenuItem href="/config" icon={<Settings className="w-4 h-4 mr-2" />}>Configuration</MenuItem>
                            <MenuItem href="/logs" icon={<FileText className="w-4 h-4 mr-2" />}>View Logs</MenuItem>
                            <MenuItem href="/permissions" icon={<UserLock className="w-4 h-4 mr-2" />}>Permisos</MenuItem>
                            <MenuItem href="/roles" icon={<UserLock className="w-4 h-4 mr-2" />}>Admin de Roles</MenuItem>
                          </>
                        )}
                      <MenuItem onClick={logout} icon={<LogOut className="w-4 h-4 mr-2" />}>Logout</MenuItem>
                    </Menu>
                  )}
                </div>
              </>
            ) : (
              // Show login button when not authenticated
              <Link href="/login" className="px-3 py-1 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-md transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="bg-gray-800 min-h-[calc(100vh-60px)] shadow-lg">
        {state.isAuthenticated ? (
          <>
            <Route path="/" component={HomePage} />
            <Route path="/health" component={HealthPage} />
            <Route path="/users" component={UserManagementPage} />
            <Route path="/browser" component={FileBrowserPage} />
            <Route path="/config" component={ConfigurationPage} />
            <Route path="/logs" component={LogsPage} />
            <Route path="/permissions" component={PermissionManagementPage} />
            <Route path="/roles" component={RolesPage} />
            <Route path="/shared-links" component={SharedLinksPage} />
            <Route path="/login" component={LoginPage} />
          </>
        ) : (
          // Public routes when not authenticated
          <>
            <Route path="/login" component={LoginPage} />
          </>
        )}

        {/* Public shared file route - available for both authenticated and non-authenticated users */}
        <Route path="/public/shared/:token">
          {params => <PublicSharedFilePage token={params.token} />}
        </Route>
      </main>

      {/* Notification container */}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AppProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
