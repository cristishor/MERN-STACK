import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Home from './pages/Home'

import withAuthentication from "./authenticationHOC"

const ProtectedHome = withAuthentication(Home);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome></Welcome>} />
        <Route path="/register" element={<Register></Register>} />
        <Route path="/login" element={<Login></Login>} />
        <Route path="/home/:userId" element={<Home/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;