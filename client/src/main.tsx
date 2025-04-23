import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure light mode is applied immediately
document.documentElement.classList.remove('dark');
document.documentElement.classList.add('light');
localStorage.setItem('theme', 'light');

createRoot(document.getElementById("root")!).render(<App />);
