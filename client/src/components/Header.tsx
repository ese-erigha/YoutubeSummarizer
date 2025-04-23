import { Link } from "wouter";

interface HeaderProps {
  onOpenHistory: () => void;
}

export const Header = ({ onOpenHistory }: HeaderProps) => {
  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <span className="text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-subtitles">
              <path d="M7 13h4"/>
              <path d="M15 13h2"/>
              <path d="M7 9h2"/>
              <path d="M13 9h4"/>
              <path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>
            </svg>
          </span>
          <h1 className="text-white text-xl font-bold">TubeSummarize</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-white hover:text-primary-200 font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home mr-1">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Home</span>
              </Link>
            </li>
            <li>
              <button
                onClick={onOpenHistory}
                className="text-white hover:text-primary-200 font-medium flex items-center"
                aria-label="View history"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history mr-1">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M12 7v5l4 2"/>
                </svg>
                <span>History</span>
              </button>
            </li>
            
            <li className="hidden md:block">
              <div className="text-xs text-white/60 px-2">
                <span className="hidden md:inline-block">
                  Ctrl+Shift+Delete to clear history
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
