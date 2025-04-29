"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface SidebarContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextProps>({
  open: false,
  setOpen: () => {},
  isMobile: false,
})

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const isMobile = useMobile()

  React.useEffect(() => {
    if (isMobile) {
      setOpen(false)
    } else {
      setOpen(defaultOpen)
    }
  }, [isMobile, defaultOpen])

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">{children}</div>
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarTrigger({ className }: React.HTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useSidebar()
  return (
    <Button variant="ghost" size="icon" className={cn("h-9 w-9", className)} onClick={() => setOpen(!open)}>
      <Menu className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export function Sidebar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, isMobile } = useSidebar()
  return (
    <aside
      className={cn(
        "border-r bg-background transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-0 md:w-16",
        isMobile && !open && "hidden",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full overflow-hidden",
          !open && "md:flex md:flex-col md:items-center md:justify-start md:gap-4 md:py-4",
        )}
      >
        {children}
      </div>
    </aside>
  )
}

export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen, isMobile } = useSidebar()
  return (
    <header
      className={cn("flex h-14 items-center gap-2 border-b px-4", !open && "md:justify-center md:px-2", className)}
      {...props}
    >
      {children}
      {isMobile && (
        <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close Sidebar</span>
        </Button>
      )}
    </header>
  )
}

export function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useSidebar()
  return (
    <div className={cn("flex-1 overflow-auto", !open && "md:items-center md:overflow-visible", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useSidebar()
  return (
    <footer
      className={cn("border-t", !open && "md:flex md:items-center md:justify-center md:px-2", className)}
      {...props}
    >
      {children}
    </footer>
  )
}

export function SidebarMenu({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useSidebar()
  return (
    <nav
      className={cn(
        "grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center",
        !open && "md:justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  )
}

export function SidebarMenuItem({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenuButton({
  className,
  children,
  asChild,
  size = "default",
  ...props
}: {
  className?: string
  children: React.ReactNode
  asChild?: boolean
  size?: "default" | "sm" | "lg"
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open } = useSidebar()
  const Comp = asChild ? React.Fragment : "button"
  return (
    <Comp
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "text-xs",
        size === "lg" && "text-base",
        !open && "md:justify-center md:px-2",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function SidebarRail({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, isMobile } = useSidebar()
  if (open || isMobile) return null
  return (
    <div
      className={cn(
        "absolute inset-y-0 left-0 z-20 w-1 bg-border opacity-0 transition-opacity group-hover:opacity-100",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarInset({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  )
}
