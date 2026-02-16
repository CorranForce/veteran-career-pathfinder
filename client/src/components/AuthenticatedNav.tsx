import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, 
  Download, 
  LayoutDashboard, 
  FileText, 
  Settings,
  LogOut,
  User,
  ChevronDown
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function AuthenticatedNav() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
      setLocation("/");
      toast.success("Logged out", {
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/tools", label: "Tools", icon: LayoutDashboard },
    { href: "/templates", label: "Templates", icon: FileText },
    { href: "/downloads", label: "Downloads", icon: Download },
  ];

  // Add admin link for platform owners
  if (user?.role === "platform_owner") {
    navItems.push({ 
      href: "/admin/dashboard", 
      label: "Admin", 
      icon: Settings 
    });
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity cursor-pointer">
              <span className="text-2xl">🧭</span>
              Pathfinder
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Mobile navigation items */}
              <div className="md:hidden">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <DropdownMenuItem className="flex items-center gap-2 w-full cursor-pointer">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </DropdownMenuItem>
                    </Link>
                  );
                })}
                <DropdownMenuSeparator />
              </div>

              <Link href="/tools">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
