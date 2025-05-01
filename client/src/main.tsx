import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure dark mode is applied immediately
document.documentElement.classList.remove('light');
document.documentElement.classList.add('dark');
localStorage.setItem('theme', 'dark');

createRoot(document.getElementById("root")!).render(<App />);
