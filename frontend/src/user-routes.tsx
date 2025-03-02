// THIS FILE IS AUTOGENERATED WHEN PAGES ARE UPDATED
import { lazy } from "react";
import { RouteObject } from "react-router";
import { SuspenseWrapper } from "./components/SuspenseWrapper";

const AddSong = lazy(() => import("./pages/AddSong.tsx"));
const App = lazy(() => import("./pages/App.tsx"));
const CreateQueue = lazy(() => import("./pages/CreateQueue.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const GuestQueueView = lazy(() => import("./pages/GuestQueueView.tsx"));
const JoinQueue = lazy(() => import("./pages/JoinQueue.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const QueueView = lazy(() => import("./pages/QueueView.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Setup = lazy(() => import("./pages/Setup.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
const SignupConfirmation = lazy(() => import("./pages/SignupConfirmation.tsx"));
const SpotifyCallback = lazy(() => import("./pages/SpotifyCallback.tsx"));

export const userRoutes: RouteObject[] = [
	{ path: "/add-song", element: <SuspenseWrapper><AddSong /></SuspenseWrapper>},
	{ path: "/addsong", element: <SuspenseWrapper><AddSong /></SuspenseWrapper>},
	{ path: "/", element: <SuspenseWrapper><App /></SuspenseWrapper>},
	{ path: "/create-queue", element: <SuspenseWrapper><CreateQueue /></SuspenseWrapper>},
	{ path: "/createqueue", element: <SuspenseWrapper><CreateQueue /></SuspenseWrapper>},
	{ path: "/dashboard", element: <SuspenseWrapper><Dashboard /></SuspenseWrapper>},
	{ path: "/forgot-password", element: <SuspenseWrapper><ForgotPassword /></SuspenseWrapper>},
	{ path: "/forgotpassword", element: <SuspenseWrapper><ForgotPassword /></SuspenseWrapper>},
	{ path: "/guest-queue-view", element: <SuspenseWrapper><GuestQueueView /></SuspenseWrapper>},
	{ path: "/guestqueueview", element: <SuspenseWrapper><GuestQueueView /></SuspenseWrapper>},
	{ path: "/join-queue", element: <SuspenseWrapper><JoinQueue /></SuspenseWrapper>},
	{ path: "/joinqueue", element: <SuspenseWrapper><JoinQueue /></SuspenseWrapper>},
	{ path: "/login", element: <SuspenseWrapper><Login /></SuspenseWrapper>},
	{ path: "/profile", element: <SuspenseWrapper><Profile /></SuspenseWrapper>},
	{ path: "/queue-view", element: <SuspenseWrapper><QueueView /></SuspenseWrapper>},
	{ path: "/queueview", element: <SuspenseWrapper><QueueView /></SuspenseWrapper>},
	{ path: "/reset-password", element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper>},
	{ path: "/resetpassword", element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper>},
	{ path: "/setup", element: <SuspenseWrapper><Setup /></SuspenseWrapper>},
	{ path: "/signup", element: <SuspenseWrapper><Signup /></SuspenseWrapper>},
	{ path: "/signup-confirmation", element: <SuspenseWrapper><SignupConfirmation /></SuspenseWrapper>},
	{ path: "/signupconfirmation", element: <SuspenseWrapper><SignupConfirmation /></SuspenseWrapper>},
	{ path: "/spotify-callback", element: <SuspenseWrapper><SpotifyCallback /></SuspenseWrapper>},
	{ path: "/spotifycallback", element: <SuspenseWrapper><SpotifyCallback /></SuspenseWrapper>},
];
