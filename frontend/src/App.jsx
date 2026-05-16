import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";

function App() {
  const token = localStorage.getItem("token");

  return (
    <>
      {token && <Navbar />}

      <Routes>
        <Route path="/" element={token ? <Navigate to="/feed" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feed" element={token ? <Feed /> : <Navigate to="/login" />} />
        <Route path="/users" element={token ? <Users /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={token ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;