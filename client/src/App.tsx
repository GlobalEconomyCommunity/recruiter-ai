import { lazy, Suspense } from 'react';
import { Redirect, Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './components/layout/AppLayout';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vacancies = lazy(() => import('./pages/Vacancies'));
const VacancyNew = lazy(() => import('./pages/VacancyNew'));
const VacancyDetail = lazy(() => import('./pages/VacancyDetail'));
const Candidates = lazy(() => import('./pages/Candidates'));
const CandidateCompare = lazy(() => import('./pages/CandidateCompare'));
const CandidateDetail = lazy(() => import('./pages/CandidateDetail'));
const Interviews = lazy(() => import('./pages/Interviews'));
const AIActivityPage = lazy(() => import('./pages/AIActivity'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Integrations = lazy(() => import('./pages/Integrations'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-[#64748B]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D1FAE5] border-t-[#10B981]" />
        Загрузка раздела…
      </div>
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/">
            <Redirect to="/dashboard" />
          </Route>

          <Route path="/dashboard" component={Dashboard} />

          <Route path="/vacancies/new" component={VacancyNew} />
          <Route path="/vacancies/:id" component={VacancyDetail} />
          <Route path="/vacancies" component={Vacancies} />

          <Route path="/candidates/compare" component={CandidateCompare} />
          <Route path="/candidates/:id" component={CandidateDetail} />
          <Route path="/candidates" component={Candidates} />

          <Route path="/interviews" component={Interviews} />
          <Route path="/ai-activity" component={AIActivityPage} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/integrations" component={Integrations} />
          <Route path="/settings" component={SettingsPage} />

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;