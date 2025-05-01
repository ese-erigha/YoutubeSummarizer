import { Link } from "wouter";
import { useEffect } from "react";

interface HeaderProps {
  onOpenHistory: () => void;
}

export const Header = ({ onOpenHistory }: HeaderProps) => {
  useEffect(() => {
    const root = window.document.documentElement;
    // Ensure dark mode is applied consistently
    root.classList.remove('light');
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return (
    <header className="bg-accent shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 md:py-4 flex flex-row items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-accent-foreground mr-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-subtitles">
              <path d="M7 13h4"/>
              <path d="M15 13h2"/>
              <path d="M7 9h2"/>
              <path d="M13 9h4"/>
              <path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>
            </svg>
          </span>
          <h1 className="text-accent-foreground text-lg md:text-xl font-bold whitespace-nowrap">TubeSummarize</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-shrink-0">
          <ul className="flex items-center space-x-2 md:space-x-6">
            <li>
              <Link href="/" className="text-accent-foreground hover:text-accent-foreground/80 font-medium flex items-center p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home mr-1 md:mr-2">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span className="hidden md:inline">Home</span>
              </Link>
            </li>
            <li>
              <button
                onClick={onOpenHistory}
                className="text-accent-foreground hover:text-accent-foreground/80 font-medium flex items-center p-2 rounded hover:bg-accent-foreground/10 transition-colors"
                aria-label="View history"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history mr-1 md:mr-2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M12 7v5l4 2"/>
                </svg>
                <span className="hidden md:inline">History</span>
              </button>
            </li>
            <li className="hidden md:block">
              <div className="text-xs text-accent-foreground/60 pl-2 py-2 border-l border-accent-foreground/20">
                <kbd className="hidden md:inline-flex items-center rounded border border-accent-foreground/30 px-1.5 text-[10px] font-medium">
                  Ctrl+Shift+Del
                </kbd>
                <span className="hidden md:inline-block ml-1">
                  to clear history
                </span>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
