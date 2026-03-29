import { createRoot } from "react-dom/client";
import { Router, Route, Switch, Redirect } from "wouter";
import App from "./App";
import Login from "./pages/Login";
import "./index.css";

const TOKEN_KEY = "pf_token";

function ProtectedApp() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return <Redirect to="/login" />;
  return <App />;
}

function LoginRoute() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return <Redirect to="/" />;
  return <Login />;
}

createRoot(document.getElementById("root")!).render(
  <Router>
    <Switch>
      <Route path="/login" component={LoginRoute} />
      <Route component={ProtectedApp} />
    </Switch>
  </Router>,
);
