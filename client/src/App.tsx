import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SimplifiedHome from "@/pages/simplified-home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/simplified" component={SimplifiedHome} />
      <Route path="/nav" component={NavPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Simple navigation page
function NavPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Navigation</h1>
      <div className="flex flex-col space-y-4">
        <Link href="/" className="text-blue-500 hover:underline">
          Regular Home Page
        </Link>
        <Link href="/simplified" className="text-blue-500 hover:underline">
          Simplified Layout (Vertical Stack Only)
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
