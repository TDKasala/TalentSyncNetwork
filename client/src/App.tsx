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
import PaymentSuccessPage from "@/pages/dashboard/payment/success";
import PaymentCancelPage from "@/pages/dashboard/payment/cancel";
import SkillsAssessmentsPage from "@/pages/skills";
import AssessmentPage from "@/pages/skills/assessment";
import AdminSkillsPage from "@/pages/admin/skills";
import ChatPage from "@/pages/chat";
import { useUser } from "@/hooks/useUser";

import { SharedLayout } from "@/components/layout/SharedLayout";
import { WebSocketProvider } from "@/components/WebSocketProvider";

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
    <SharedLayout>
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
        
        {/* Payment routes - need protection but should allow either candidate or recruiter roles */}
        <Route path="/dashboard/payment/success">
          {() => <ProtectedRoute component={PaymentSuccessPage} />}
        </Route>
        <Route path="/dashboard/payment/cancel">
          {() => <ProtectedRoute component={PaymentCancelPage} />}
        </Route>
        
        {/* Skills Assessment Routes */}
        <Route path="/skills">
          <SkillsAssessmentsPage />
        </Route>
        <Route path="/skills/assessment/:id">
          {({ id }) => <AssessmentPage id={id} />}
        </Route>
        <Route path="/skills/assessment/:id/attempt/:attemptId">
          {({ id, attemptId }) => <AssessmentPage id={id} attemptId={attemptId} />}
        </Route>
        
        {/* Chat Demo Route */}
        <Route path="/chat">
          <ChatPage />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin/skills">
          {() => <ProtectedRoute component={AdminSkillsPage} />}
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </SharedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <WebSocketProvider>
            <Router />
          </WebSocketProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
