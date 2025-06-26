import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <header className="w-full flex justify-between items-center px-8 py-4 border-b mb-8">
      <span className="font-bold text-xl">SaaS Starter</span>
      <nav className="flex gap-4">
        <Link href="/auth/login" passHref legacyBehavior>
          <Button variant="link" asChild>
            <a>Login</a>
          </Button>
        </Link>
        <Link href="/pricing" passHref legacyBehavior>
          <Button variant="link" asChild>
            <a>Pricing</a>
          </Button>
        </Link>
      </nav>
    </header>
  )
} 