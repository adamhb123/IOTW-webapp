// External modules
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OidcProvider } from "@axa-fr/react-oidc";
import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import "bootstrap/dist/css/bootstrap.css";
// Local modules
import "./index.css";
import Config from "./misc/config";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
);

root.render(
  <OidcProvider configuration={Config.sso}>
    <NavBar/>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </OidcProvider>
);
