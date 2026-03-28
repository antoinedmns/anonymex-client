import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import TestsAPI from './pages/TestsAPI'
import EpreuvesPage from './pages/epreuves/EpreuvesPage'
import TestsComponents from './pages/TestsComponents'
import PageInscription from './pages/authentification/signup/PageInscription'
import PageConnexion from './pages/authentification/login/PageConnexion'
import PageSession from './pages/accueil/PageAccueil'

function App() {
  return (
    <Routes>
      { /* Authentification */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PageConnexion />} />
      <Route path="/invitation/:jeton" element={<PageInscription />} />

      { /* Sessions*/}
      <Route path="/accueil" element={<PageSession />} />

      { /* Examens/épreuves */}
      <Route path="/sessions/:sessionId/epreuves" element={<EpreuvesPage />} />

      { /* Autre */}
      <Route path="/tests" element={<TestsAPI />} />

      { /* Tests Composants */}
      <Route path="/tests2" element={<TestsComponents />} />

    </Routes>
  )
}

export default App
