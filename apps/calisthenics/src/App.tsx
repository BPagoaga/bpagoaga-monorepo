import { Navigate, Route, Routes } from 'react-router';
import RequireAuth from './components/RequireAuth';
import CurrentSession from './pages/CurrentSession';
import Dashboard from './pages/Dashboard';
import ExerciseDetail from './pages/ExerciseDetail';
import FinishSession from './pages/FinishSession';
import Journal from './pages/Journal';
import LevelResults from './pages/LevelResults';
import LevelTest from './pages/LevelTest';
import Programme from './pages/Programme';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import StartSession from './pages/StartSession';
import TemplateEditor from './pages/TemplateEditor';
import Tutorials from './pages/Tutorials';

const App = () => (
  <Routes>
    <Route element={<RequireAuth when="signed-out" />}>
      <Route path="/connexion" element={<SignIn />} />
      <Route path="/inscription" element={<SignUp />} />
    </Route>
    <Route element={<RequireAuth when="signed-in" />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/bienvenue/test" element={<LevelTest />} />
      <Route path="/bienvenue/resultats" element={<LevelResults />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/seance" element={<CurrentSession />} />
      <Route path="/seance/nouvelle" element={<StartSession />} />
      <Route path="/seance/fin" element={<FinishSession />} />
      <Route path="/programme" element={<Programme />} />
      <Route path="/programme/modeles/nouveau" element={<TemplateEditor />} />
      <Route path="/programme/modeles/:templateId" element={<TemplateEditor />} />
      <Route path="/tutoriels" element={<Tutorials />} />
      <Route path="/tutoriels/:exerciseId" element={<ExerciseDetail />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
