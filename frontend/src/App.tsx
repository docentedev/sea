import { Router, Route } from 'wouter';
import { AppProvider } from './contexts/AppContext';
import { HomePage } from './pages/HomePage';
import { HealthPage } from './pages/HealthPage';
import { NavLink } from './components/NavLink';

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto bg-white min-h-[calc(100vh-60px)] shadow-lg">
          <Route path="/" component={HomePage} />
          <Route path="/health" component={HealthPage} />
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
