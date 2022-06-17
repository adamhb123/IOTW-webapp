// External modules
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OidcProvider } from "@axa-fr/react-oidc";
import Home from "./pages/Home";
import Submissions from "./pages/Submissions";
import NavBar from "./components/NavBar";
import "bootstrap/dist/css/bootstrap.css";
// Local modules
import "./index.scss";
import Config from "./misc/config";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const AppRoutes = () => (
  <Routes>
    <Route path="/my-submissions" element={<Submissions userOnly />} />
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

export default root;
