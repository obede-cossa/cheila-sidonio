import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <a href="#top" className="font-serif text-xl tracking-wide">
          Cheila &amp; Sidonio <span className="text-primary">♡</span>
        </a>
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a href="#lista" className="hover:text-foreground">
            A nossa lista
          </a>
          <a href="#ajuda" className="hover:text-foreground">
            Como funciona
          </a>
        </nav>
        {/*
          Always links to /login. /login redirects to /dashboard when a session
          exists, which keeps this header free of cookie reads and lets the
          public page prerender.
        */}
        <Link
          href="/login"
          className="rounded-full border border-primary/30 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Área dos noivos
        </Link>
      </div>
    </header>
  )
}
