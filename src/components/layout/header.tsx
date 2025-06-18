
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useLocation } from "wouter"
import { LogOut, User, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { navItems } from "@/nav-items"

export function Header() {
  const { user, signOut } = useAuth()
  const [location, setLocation] = useLocation()

  const handleSignOut = async () => {
    await signOut()
    setLocation("/")
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => setLocation("/")}
            className="text-xl font-bold hover:opacity-80 transition-opacity"
          >
            &lt;/&gt;instanti<span className="text-primary">8</span>.dev
          </button>
          
          {/* Desktop Navigation Menu */}
          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  variant={location === item.to ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLocation(item.to)}
                  className="flex items-center space-x-2"
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Button>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Navigation Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Menu className="h-4 w-4" />
                  <span>Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navItems.map((item) => (
                  <DropdownMenuItem
                    key={item.to}
                    onClick={() => setLocation(item.to)}
                    className="flex items-center space-x-2"
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setLocation("/auth")} size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
