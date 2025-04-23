const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <span className="text-primary mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 13h4"/>
                  <path d="M15 13h2"/>
                  <path d="M7 9h2"/>
                  <path d="M13 9h4"/>
                  <path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>
                </svg>
              </span>
              <p className="text-foreground font-semibold">TubeSummarize</p>
            </div>
            <p className="text-muted-foreground text-sm mt-1 text-center md:text-left">
              The AI-powered YouTube transcript summarizer
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} TubeSummarize. All rights reserved.
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Not affiliated with YouTube. Powered by OpenAI GPT-4o.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
