import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Success from "./pages/Success";
import Admin from "./pages/Admin";
import Marketing from "./pages/Marketing";
import Downloads from "./pages/Downloads";
import ProfileEdit from "./pages/ProfileEdit";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ResumeTemplates from "./pages/ResumeTemplates";
import AdminTemplates from "./pages/AdminTemplates";
import PlatformOwnerDashboard from "./pages/PlatformOwnerDashboard";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GoogleCallback from "./pages/GoogleCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AccountSettings from "./pages/AccountSettings";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />
      <Route path={"/auth/google/callback"} component={GoogleCallback} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path={"/verify-email"} component={VerifyEmail} />
      <Route path={"/account-settings"} component={AccountSettings} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/success"} component={Success} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/marketing"} component={Marketing} />
      <Route path={"/downloads"} component={Downloads} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/profile/edit"} component={ProfileEdit} />
      <Route path={"/dashboard"}>
        <Redirect to="/tools" />
      </Route>
      <Route path={"/tools"} component={Dashboard} />
      <Route path={"/admin/dashboard"} component={PlatformOwnerDashboard} />
      <Route path={"/admin/analytics"} component={AdminDashboard} />
      <Route path={"/admin/templates"} component={AdminTemplates} />
      <Route path={"/templates"} component={ResumeTemplates} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
