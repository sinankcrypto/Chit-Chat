import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import { PresenceProvider } from "./context/PresenceContext";
import { NotificationProvider } from "./context/NotificationContext";
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/chatContext";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Router>
      <SocketProvider>
        <ChatProvider>
          <PresenceProvider>
            <NotificationProvider>
                <Toaster position="top-right" reverseOrder={false}/>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                    } 
                  />
                </Routes> 
            </NotificationProvider>
          </PresenceProvider>
        </ChatProvider>
      </SocketProvider>
    </Router>
       
  );
}

export default App;