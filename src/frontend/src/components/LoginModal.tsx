import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginModalProps {
  trigger?: React.ReactNode;
  onLoginSuccess?: () => void;
}

export function LoginModal({ trigger, onLoginSuccess }: LoginModalProps) {
  const [open, setOpen] = useState(false);
  const {
    login,
    isLoggingIn,
    isLoginSuccess,
    clear,
    identity,
    isInitializing,
  } = useInternetIdentity();

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    clear();
    setOpen(false);
  };

  // Close modal on successful login
  if (isLoginSuccess && open) {
    setTimeout(() => {
      setOpen(false);
      onLoginSuccess?.();
    }, 500);
  }

  const isAuthenticated = !!identity;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            data-ocid="nav.admin_link"
          >
            Admin Login
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md card-glass border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {isAuthenticated ? "Account" : "Admin Access"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          {isAuthenticated ? (
            <>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Logged in as
                </p>
                <p className="font-mono text-xs text-foreground/80 max-w-[280px] truncate">
                  {identity?.getPrincipal().toString()}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setOpen(false);
                    window.location.href = "/admin";
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleLogout}
                  data-ocid="auth.logout_button"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-float-up">
                  <LogIn className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">
                    Access Dashboard
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect with Internet Identity to manage your affiliate
                    offers
                  </p>
                </div>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green font-semibold"
                onClick={handleLogin}
                disabled={isLoggingIn || isInitializing}
                data-ocid="auth.login_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Sign In with Internet Identity
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Decentralized, passwordless authentication powered by the
                Internet Computer
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
