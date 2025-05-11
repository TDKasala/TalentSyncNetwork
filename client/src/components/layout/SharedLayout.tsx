import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { 
  Home, 
  Briefcase, 
  Award, 
  User, 
  LogOut, 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  BarChart, 
  Settings,
  Trophy,
  MessageSquare
} from "lucide-react";

export function SharedLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isLoading } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.startsWith(path) ? "text-primary font-medium" : "text-muted-foreground";
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-bold text-primary flex items-center">
              <span className="mr-1">Talent</span>
              <span className="text-orange-500">Sync</span>
              <span className="text-orange-500 font-normal">ZA</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className={`text-sm ${isActive("/")}`}>
                Home
              </Link>
              <Link href="/jobs" className={`text-sm ${isActive("/jobs")}`}>
                Jobs
              </Link>
              <Link href="/skills" className={`text-sm ${isActive("/skills")}`}>
                Skills
              </Link>
              <Link href="/chat" className={`text-sm ${isActive("/chat")}`}>
                Chat
              </Link>
              {user?.role === "candidate" && (
                <Link href="/dashboard/candidate" className={`text-sm ${isActive("/dashboard/candidate")}`}>
                  Dashboard
                </Link>
              )}
              {user?.role === "recruiter" && (
                <Link href="/dashboard/recruiter" className={`text-sm ${isActive("/dashboard/recruiter")}`}>
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User size={16} />
                      {user.firstName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "candidate" && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/candidate" className="cursor-pointer">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "recruiter" && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/recruiter" className="cursor-pointer">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/skills" className="cursor-pointer">
                        Skills Assessment
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/chat" className="cursor-pointer">
                        <MessageSquare size={16} className="mr-2" />
                        Chat & Messaging
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "recruiter" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/skills" className="cursor-pointer">
                          Manage Assessments
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500">
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button size="icon" variant="ghost">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="md:hidden p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-4 gap-4">
                  <SheetClose asChild>
                    <Link href="/" className="flex items-center gap-2 p-2">
                      <Home size={20} />
                      <span>Home</span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/jobs" className="flex items-center gap-2 p-2">
                      <Briefcase size={20} />
                      <span>Jobs</span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/skills" className="flex items-center gap-2 p-2">
                      <Award size={20} />
                      <span>Skills</span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/chat" className="flex items-center gap-2 p-2">
                      <MessageSquare size={20} />
                      <span>Chat</span>
                    </Link>
                  </SheetClose>

                  {user && (
                    <>
                      <div className="h-[1px] bg-muted my-2"></div>
                      
                      {user.role === "candidate" && (
                        <SheetClose asChild>
                          <Link href="/dashboard/candidate" className="flex items-center gap-2 p-2">
                            <User size={20} />
                            <span>Candidate Dashboard</span>
                          </Link>
                        </SheetClose>
                      )}
                      
                      {user.role === "recruiter" && (
                        <>
                          <SheetClose asChild>
                            <Link href="/dashboard/recruiter" className="flex items-center gap-2 p-2">
                              <Briefcase size={20} />
                              <span>Recruiter Dashboard</span>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/admin/skills" className="flex items-center gap-2 p-2">
                              <Trophy size={20} />
                              <span>Manage Assessments</span>
                            </Link>
                          </SheetClose>
                        </>
                      )}
                      
                      <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 p-2 text-red-500 hover:bg-red-50 rounded-md"
                      >
                        <LogOut size={20} />
                        <span>Logout</span>
                      </button>
                    </>
                  )}
                  
                  {!user && (
                    <>
                      <div className="h-[1px] bg-muted my-2"></div>
                      <SheetClose asChild>
                        <Link href="/auth/login" className="flex items-center gap-2 p-2">
                          <LogIn size={20} />
                          <span>Login</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/auth/register" className="flex items-center gap-2 p-2">
                          <UserPlus size={20} />
                          <span>Register</span>
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-primary flex items-center">
              <span className="mr-1">Talent</span>
              <span className="text-orange-500">Sync</span>
              <span className="text-orange-500 font-normal">ZA</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Connect talent with opportunity across South Africa
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Platform</span>
              <Link href="/jobs" className="text-muted-foreground hover:text-primary">Jobs</Link>
              <Link href="/skills" className="text-muted-foreground hover:text-primary">Skills</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Company</span>
              <Link href="/about" className="text-muted-foreground hover:text-primary">About</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary">Terms</Link>
            </div>
          </div>
        </div>
        <div className="container mt-6 border-t pt-6">
          <p className="text-xs text-center text-muted-foreground">
            © {new Date().getFullYear()} TalentSyncZA. All rights reserved. B-BBEE Level 1 & POPIA Compliant.
          </p>
        </div>
      </footer>
    </div>
  );
}