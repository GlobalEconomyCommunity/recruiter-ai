import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Vacancies from "./pages/Vacancies";
import VacancyNew from "./pages/VacancyNew";
import VacancyDetail from "./pages/VacancyDetail";
import Candidates from "./pages/Candidates";
import CandidateDetail from "./pages/CandidateDetail";
import Interviews from "./pages/Interviews";
import AIActivityPage from "./pages/AIActivity";
import Analytics from "./pages/Analytics";
import Integrations from "./pages/Integrations";
import SettingsPage from "./pages/Settings";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/"><Redirect to="/dashboard" /></Route>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/vacancies" component={Vacancies} />
        <Route path="/vacancies/new" component={VacancyNew} />
        <Route path="/vacancies/:id" component={VacancyDetail} />
        <Route path="/candidates" component={Candidates} />
        <Route path="/candidates/:id" component={CandidateDetail} />
        <Route path="/interviews" component={Interviews} />
        <Route path="/ai-activity" component={AIActivityPage} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
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

