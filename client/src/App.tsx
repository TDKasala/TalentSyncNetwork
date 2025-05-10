import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import CandidateDashboard from "@/pages/dashboard/candidate";
import RecruiterDashboard from "@/pages/dashboard/recruiter";
import JobsPage from "@/pages/jobs";
import { useUser } from "@/hooks/useUser";

function Router() {
  const { user, isLoading } = useUser();

  // Protected route component
  const ProtectedRoute = ({ component: Component, role }: { component: React.ComponentType, role?: string }) => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
    }
    
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/auth/login";
      return null;
    }
    
    // Check if role is required and if user has the right role
    if (role && user.role !== role) {
      return <NotFound />;
    }
    
    return <Component />;
  };

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/jobs">
        <JobsPage />
      </Route>
      
      {/* Protected Routes */}
      <Route path="/dashboard/candidate">
        {() => <ProtectedRoute component={CandidateDashboard} role="candidate" />}
      </Route>
      <Route path="/dashboard/recruiter">
        {() => <ProtectedRoute component={RecruiterDashboard} role="recruiter" />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
