import { Router, Route } from 'wouter';
import { AppProvider } from './contexts/AppContext';
import { HomePage } from './pages/HomePage';
import { HealthPage } from './pages/HealthPage';
import { NavLink } from './components/NavLink';

function AppContent() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Navigation */}
        <nav style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #ddd',
          padding: '0 20px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            height: '60px'
          }}>
            <NavLink href="/">
              <span style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                NAS Cloud
              </span>
            </NavLink>

            <div style={{ display: 'flex', gap: '20px', marginLeft: '40px' }}>
              <NavLink href="/">Home</NavLink>
              <NavLink href="/health">System Health</NavLink>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'white',
          minHeight: 'calc(100vh - 60px)',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
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
