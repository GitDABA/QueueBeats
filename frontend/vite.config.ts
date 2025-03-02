import react from "@vitejs/plugin-react";
import "dotenv/config";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import injectHTML from "vite-plugin-html-inject";
import tsConfigPaths from "vite-tsconfig-paths";

type Extension = {
	name: string;
	version: string;
	config: Record<string, unknown>;
};

enum ExtensionName {
	FIREBASE_AUTH = "firebase-auth",
}

const listExtensions = (): Extension[] => {
	if (process.env.DATABUTTON_EXTENSIONS) {
		try {
			return JSON.parse(process.env.DATABUTTON_EXTENSIONS) as Extension[];
		} catch (err: unknown) {
			console.error("Error parsing DATABUTTON_EXTENSIONS", err);
			console.error(process.env.DATABUTTON_EXTENSIONS);
			return [];
		}
	}

	return [];
};

const extensions = listExtensions();

const getExtensionConfig = (name: string): string => {
	const extension = extensions.find((it) => it.name === name);

	if (!extension) {
		console.warn(`Extension ${name} not found`);
	}

	return JSON.stringify(extension?.config);
};

const buildVariables = () => {
	const appId = process.env.DATABUTTON_PROJECT_ID;
	const isNetlify = process.env.NETLIFY === 'true';

	const apiUrl = process.env.VITE_API_URL || 
		(isNetlify ? '' : 'http://localhost:8001');
	
	const wsApiUrl = process.env.VITE_WS_API_URL || 
		(isNetlify ? (apiUrl.replace('https://', 'wss://').replace('http://', 'ws://')) : 'ws://localhost:8001');

	const defines: Record<string, string> = {
		__APP_ID__: JSON.stringify(appId),
		__API_PATH__: JSON.stringify(isNetlify ? "/api" : ""),
		__API_URL__: JSON.stringify(apiUrl),
		__WS_API_URL__: JSON.stringify(wsApiUrl),
		__APP_BASE_PATH__: JSON.stringify("/"),
		__APP_TITLE__: JSON.stringify("QueueBeats"),
		__APP_FAVICON_LIGHT__: JSON.stringify("/favicon-light.svg"),
		__APP_FAVICON_DARK__: JSON.stringify("/favicon-dark.svg"),
		__APP_DEPLOY_USERNAME__: JSON.stringify(""),
		__APP_DEPLOY_APPNAME__: JSON.stringify(""),
		__APP_DEPLOY_CUSTOM_DOMAIN__: JSON.stringify(""),
		__FIREBASE_CONFIG__: JSON.stringify(
			getExtensionConfig(ExtensionName.FIREBASE_AUTH),
		),
		__SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
		__SUPABASE_ANON_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
	};

	return defines;
};

// Get the backend port from environment variable or use the default
const backendPort = process.env.BACKEND_PORT || '8001';
// Get the frontend port from environment variable or use the default
const frontendPort = parseInt(process.env.FRONTEND_PORT || '5173', 10);

// https://vite.dev/config/
export default defineConfig({
	define: buildVariables(),
	plugins: [react(), splitVendorChunkPlugin(), tsConfigPaths(), injectHTML()],
	server: {
		port: frontendPort,
		proxy: {
			"/routes": {
				target: `http://127.0.0.1:${backendPort}`,
				changeOrigin: true,
				rewrite: (path) => path,
			},
			"/api": {
				target: `http://127.0.0.1:${backendPort}`, 
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '/routes'),
			},
			// Handle any Supabase direct access
			"/supabase": {
				target: `http://127.0.0.1:${backendPort}`,
				changeOrigin: true,
			},
			"/supabase-config": {
				target: `http://127.0.0.1:${backendPort}`,
				changeOrigin: true,
			}
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
	},
	optimizeDeps: {
		include: ['react', 'react-dom', 'react-router-dom'],
		exclude: []
	},
	build: {
		outDir: 'dist',
		sourcemap: true
	}
});
