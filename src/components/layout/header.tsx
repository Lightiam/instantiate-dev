
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useLocation } from "wouter"
import { LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, signOut } = useAuth()
  const [, setLocation] = useLocation()

  const handleSignOut = async () => {
    await signOut()
    setLocation("/")
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setLocation("/")}
            className="text-xl font-bold hover:opacity-80 transition-opacity"
          >
            &lt;/&gt;instanti<span className="text-primary">8</span>.dev
          </button>
        </div>

        <div className="flex items-center space-x-4">
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
