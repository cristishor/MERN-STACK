import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
//import setAuthToken from "./utilities/token";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome></Welcome>} />
        <Route path="/users/register" element={<Register></Register>} />
        <Route path="/users/login" element={<Login></Login>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
