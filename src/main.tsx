import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (import.meta.env.DEV) {
	const originalInfo = console.info.bind(console);
	const originalDebug = console.debug.bind(console);

	console.info = (...args: unknown[]) => {
		const first = String(args[0] ?? "");
		if (first.includes("Download the React DevTools")) return;
		originalInfo(...args);
	};

	console.debug = (...args: unknown[]) => {
		const first = String(args[0] ?? "");
		if (first.includes("[vite] connecting") || first.includes("[vite] connected")) return;
		originalDebug(...args);
	};
}

createRoot(document.getElementById("root")!).render(<App />);
