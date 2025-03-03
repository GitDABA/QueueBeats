/**
 * QueueBeats Frontend Vite Configuration
 * 
 * This file configures the Vite build tool for the QueueBeats frontend application.
 * Key configurations:
 * - Environment variables handling and defaults
 * - Server port configuration (default: 5173, configurable via FRONTEND_PORT)
 * - API proxy settings to route API requests to the backend server
 * - Build optimization settings
 * - Plugin configuration
 * 
 * The configuration automatically detects if running in Netlify environment
 * and adjusts settings accordingly.
 */

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
		(isNetlify ? '' : 'ws://localhost:8001');

	const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
	const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

	return {
		...(appId && { "import.meta.env.VITE_APP_ID": JSON.stringify(appId) }),
		"import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
		"import.meta.env.VITE_WS_API_URL": JSON.stringify(wsApiUrl),
		"import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
		"import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseKey),
		...(extensions.some((it) => it.name === ExtensionName.FIREBASE_AUTH) && {
			"import.meta.env.VITE_FIREBASE_AUTH_CONFIG": getExtensionConfig(
				ExtensionName.FIREBASE_AUTH
			),
		}),
	};
};

// Get the backend port from environment variable or use the default
const backendPort = process.env.BACKEND_PORT || '8001';
// Get the frontend port from environment variable or use the default
const frontendPort = parseInt(process.env.FRONTEND_PORT || '5173', 10);

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [tsConfigPaths(), react(), splitVendorChunkPlugin(), injectHTML()],
	define: {
		...buildVariables(),
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
		dedupe: ['react', 'react-dom'],
	},
	optimizeDeps: {
		include: [
			'react', 
			'react-dom', 
			'react-router-dom',
			'@supabase/supabase-js',
		],
		esbuildOptions: {
			target: 'es2020',
		},
	},
	build: {
		target: 'es2020',
		outDir: "build",
		sourcemap: true,
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
					'supabase-vendor': ['@supabase/supabase-js'],
				},
			},
		},
	},
	server: {
		port: frontendPort,
		strictPort: true,
		proxy: {
			// Main API paths - direct endpoints
			"/debug": {
				target: `http://127.0.0.1:${backendPort}`,
				changeOrigin: true,
			},
			// Routed API paths (from app/apis/*)
			"/routes": {
				target: `http://127.0.0.1:${backendPort}`,
				changeOrigin: true,
			},
			// Legacy API path support
			"/api": {
				target: `http://127.0.0.1:${backendPort}`, 
				changeOrigin: true,
				rewrite(path) {
					return path.replace(/^\/api/, "");
				}
			},
			// Netlify Functions
			"/.netlify/functions/database-health-check": {
				target: "http://localhost:8888",
				changeOrigin: true,
			},
			"/.netlify/functions/spotify-search": {
				target: "http://localhost:8888",
				changeOrigin: true,
			},
			// Spotify API proxy
			"/spotify": {
				target: "http://localhost:8888",
				changeOrigin: true,
			}
		},
	},
});
