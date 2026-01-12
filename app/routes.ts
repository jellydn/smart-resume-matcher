import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("resume", "routes/resume.tsx"),
	route("job", "routes/job.tsx"),
	route("login", "routes/login.tsx"),
	route("signup", "routes/signup.tsx"),
	route("api/auth/*", "routes/api.auth.$.tsx"),
	route("api/resume", "routes/api.resume.tsx"),
] satisfies RouteConfig;
