import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Add all auth-related HTTP routes
auth.addHttpRoutes(http);

export default http;
