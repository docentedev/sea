import { Route, Router } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { HealthPage } from './pages/HealthPage';
import { NavLink } from './components/NavLink';

function AppContent() {
  const { state, logout } = useAuth();

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-300 px-5">
        <div className="max-w-6xl mx-auto flex items-center h-15">
          <NavLink href="/">
            <span className="text-2xl font-bold text-gray-800">
              NAS Cloud
            </span>
          </NavLink>

          <div className="flex gap-5 ml-10">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/health">System Health</NavLink>
          </div>

          {/* User info and logout */}
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-medium text-gray-900">{state.user?.username}</span>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {typeof state.user?.role === 'object' ? state.user.role.display_name : state.user?.role || 'User'}
              </span>
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto bg-white min-h-[calc(100vh-60px)] shadow-lg">
        <Route path="/" component={HomePage} />
        <Route path="/health" component={HealthPage} />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
