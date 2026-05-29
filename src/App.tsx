import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { SubjectSelect } from "./pages/SubjectSelect";
import { ExamRoom } from "./pages/ExamRoom";
import { ResultSummary } from "./pages/ResultSummary";
import { History } from "./pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages with sidebar layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/select" element={<SubjectSelect />} />
        </Route>

        {/* Full-screen exam — no sidebar */}
        <Route path="/exam" element={<ExamRoom />} />
        <Route path="/result/:id" element={<ResultSummary />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
