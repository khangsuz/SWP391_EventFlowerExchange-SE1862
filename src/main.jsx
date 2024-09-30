import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId="112400752729-im8bo2dssg8vn97l8vcnmvocrri8mnbm.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
);