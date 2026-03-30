import { Navigate, Outlet, useParams } from 'react-router-dom';
import { EpreuvesCacheProvider } from '../../contexts/EpreuvesCacheContext';
import { ModalProvider } from '../../contexts/ModalContext';

export default function SessionEpreuvesProviderRoute() {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    return <Navigate to='/accueil' replace />;
  }

  return (
    <EpreuvesCacheProvider key={sessionId} sessionId={Number(sessionId)}>
      <ModalProvider>
        <Outlet />
      </ModalProvider>
    </EpreuvesCacheProvider>
  );
}
