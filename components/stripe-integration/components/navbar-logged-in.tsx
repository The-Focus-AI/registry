import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/logout-button'

export default function NavbarLoggedIn() {
  return (
    <header className="w-full flex justify-between items-center px-8 py-4 border-b mb-8">
      <span className="font-bold text-xl">SaaS Starter</span>
      <nav className="flex gap-4 items-center">
        <Link href="/dashboard" passHref legacyBehavior>
          <Button variant="link" asChild>
            <a>Dashboard</a>
          </Button>
        </Link>
        <Link href="/pricing" passHref legacyBehavior>
          <Button variant="link" asChild>
            <a>Pricing</a>
          </Button>
        </Link>
        <LogoutButton />
      </nav>
    </header>
  )
} 