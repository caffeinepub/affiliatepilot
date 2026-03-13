import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { LoginModal } from "./components/LoginModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";
import AdminDashboard from "./pages/AdminDashboard";
import Storefront from "./pages/Storefront";

type Page = "home" | "admin";

function Header({
  page,
  onNavigate,
}: { page: Page; onNavigate: (p: Page) => void }) {
  const { identity, clear } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 font-display font-bold text-xl hover:opacity-80 transition-opacity"
          onClick={() => onNavigate("home")}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="text-gradient-green">Affiliate</span>
          <span>Pilot</span>
        </button>

        <nav className="flex items-center gap-2">
          {isAuthenticated && isAdmin && (
            <Button
              variant={page === "admin" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => onNavigate("admin")}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          )}
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={clear}
              data-ocid="auth.logout_button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <LoginModal
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  data-ocid="nav.admin_link"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              }
              onLoginSuccess={() => onNavigate("admin")}
            />
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-gradient-green">Affiliate</span>
            <span>Pilot</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>
              © {currentYear}. Built with ❤️ using{" "}
              <a
                href={utmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                caffeine.ai
                <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/admin") {
      setPage("admin");
    }
  }, []);

  const handleNavigate = (p: Page) => {
    setPage(p);
    window.history.pushState({}, "", p === "admin" ? "/admin" : "/");
  };

  const isAuthenticated = !!identity;
  const showAdmin =
    page === "admin" &&
    isAuthenticated &&
    (isAdmin === true || isAdmin === undefined);

  return (
    <div className="min-h-screen flex flex-col">
      <Header page={page} onNavigate={handleNavigate} />
      <motion.div
        key={page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        {showAdmin ? (
          <AdminDashboard />
        ) : page === "admin" && !isAuthenticated ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
            <Shield className="h-16 w-16 text-primary/40" />
            <h2 className="font-display text-2xl font-bold">
              Admin Access Required
            </h2>
            <p className="text-muted-foreground max-w-sm">
              Please log in with your admin credentials to access the dashboard.
            </p>
            <LoginModal
              trigger={
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
                  data-ocid="auth.login_button"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Login to Admin
                </Button>
              }
              onLoginSuccess={() => handleNavigate("admin")}
            />
          </div>
        ) : (
          <Storefront />
        )}
      </motion.div>
      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
