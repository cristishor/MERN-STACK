import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Home from './pages/Home'
import NewProject from './pages/NewProject'
import ProjectPage from "./pages/ProjectPage"
import NotFoundPage from "./pages/NotFoundPage"
import ProjectDetails from "./pages/ProjectDetails"
//import ProjectManagement from "./pages/ProjectManagement"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome></Welcome>} />
        <Route path="/register" element={<Register></Register>} />
        <Route path="/login" element={<Login></Login>} />
        <Route path="/home/:userId" element={<Home/>} />

        <Route path="/new-project/:userId" element={<NewProject/>} />
        <Route path="/p/:projId/:userId" element={<ProjectPage/>} />

        <Route path="/p-info/:projId/:userId" element={<ProjectDetails/>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;