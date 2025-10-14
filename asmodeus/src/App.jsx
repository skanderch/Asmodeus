import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Espacecandidat from "./pages/Espacecandidat.jsx";
import Register from "./pages/Register.jsx";
import Navbar from "./components/Navbar.jsx";
import Offres from "./pages/Offres.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/espace" element={<Espacecandidat />} />
        <Route path="/offres" element={<Offres />} />
      </Routes>
    </Router>
  );
}

export default App;
