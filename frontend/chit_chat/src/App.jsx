import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import VerifyOtp from "./pages/VerifyOtp";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import { PresenceProvider } from "./context/PresenceContext";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <PresenceProvider>
      <NotificationProvider>
        <Router>
          <Toaster position="top-right" reverseOrder={false}/>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/chat" element={<Home />} />
          </Routes> 
        </Router>
      </NotificationProvider>
    </PresenceProvider>
    
  );
}

export default App;