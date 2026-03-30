import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import TestsAPI from './pages/TestsAPI'
import EpreuvesPage from './pages/epreuves/EpreuvesPage'
import TestsComponents from './pages/TestsComponents'
import PageInscription from './pages/authentification/signup/PageInscription'
import PageConnexion from './pages/authentification/login/PageConnexion'
import PageSession from './pages/accueil/PageAccueil'
import RecherchePage from './pages/epreuves/RecherchePage'
import SessionEpreuvesProviderRoute from './pages/epreuves/SessionEpreuvesProviderRoute'

function App() {
  return (
    <Routes>
      { /* Authentification */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PageConnexion />} />
      <Route path="/invitation/:jeton" element={<PageInscription />} />

      { /* Sessions*/}
      <Route path="/accueil" element={<PageSession />} />

      { /* Examens/épreuves + recherche (cache session) */}
      <Route path="/sessions/:sessionId/*" element={<SessionEpreuvesProviderRoute />}>
        <Route path="epreuves" element={<EpreuvesPage />} />
        <Route path="recherche/:type/:value1/:value2?" element={<RecherchePage />} />
      </Route>

      { /* Autre */}
      <Route path="/tests" element={<TestsAPI />} />

      { /* Tests Composants */}
      <Route path="/tests2" element={<TestsComponents />} />

    </Routes>
  )
}

export default App
