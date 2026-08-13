import { BrowserRouter, Route, Routes } from "react-router-dom";
import Overview from "./pages/Overview";
import TerritoryDetail from "./pages/TerritoryDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/territory/:manager" element={<TerritoryDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
