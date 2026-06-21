import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueueProvider } from "./context/QueueContext";
import { ToastProvider } from "./context/ToastContext";
import Home from "./pages/Home";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import PatientWaitingRoom from "./pages/PatientWaitingRoom";
import MyTokenLookup from "./pages/MyTokenLookup";

function App() {
  return (
    <ToastProvider>
      <QueueProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<ReceptionistDashboard />} />
            <Route path="/waiting-room" element={<PatientWaitingRoom />} />
            <Route path="/waiting-room/my-token" element={<MyTokenLookup />} />
          </Routes>
        </BrowserRouter>
      </QueueProvider>
    </ToastProvider>
  );
}

export default App;
