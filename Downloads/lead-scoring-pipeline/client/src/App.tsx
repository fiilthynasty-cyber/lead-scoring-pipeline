import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Pipeline from "./pages/Pipeline";
import Subscribers from "./pages/Subscribers";
import Settings from "./pages/Settings";
import AIScoring from "./pages/AIScoring";
import Outreach from "./pages/Outreach";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import LeadFinder from "./pages/LeadFinder";
import DashboardLayout from "./components/DashboardLayout";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"}>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      <Route path={"/leads"}>
        <DashboardLayout>
          <Leads />
        </DashboardLayout>
      </Route>
      <Route path={"/pipeline"}>
        <DashboardLayout>
          <Pipeline />
        </DashboardLayout>
      </Route>
      <Route path={"/subscribers"}>
        <DashboardLayout>
          <Subscribers />
        </DashboardLayout>
      </Route>
      <Route path={"/ai-scoring"}>
        <DashboardLayout>
          <AIScoring />
        </DashboardLayout>
      </Route>
      <Route path={"/outreach"}>
        <DashboardLayout>
          <Outreach />
        </DashboardLayout>
      </Route>
      <Route path={"/notifications"}>
        <DashboardLayout>
          <Notifications />
        </DashboardLayout>
      </Route>
      <Route path={"/analytics"}>
        <DashboardLayout>
          <Analytics />
        </DashboardLayout>
      </Route>
      <Route path={"/lead-finder"} component={LeadFinder} />
      <Route path={"/settings"}>
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
