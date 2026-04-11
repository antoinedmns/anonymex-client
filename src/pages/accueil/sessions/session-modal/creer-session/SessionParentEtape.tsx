import { useState } from "react";
import SessionEtapeTexte from "./SessionEtapeTexte";
import SessionEtapeTeleversement from "./SessionEtapeTeleversement";
import { Modal } from "../../../../../components/Modal";
import { createSession } from "../../../../../contracts/sessions";
import { URL_API_BASE } from "../../../../../utils/api";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import { Snackbar } from "@mui/material";

type Props = {
    onClose: () => void;
    /* Si donné, affichera directement l'import du fichier. */
    importSessionId?: number;
};

export default function SessionParentEtape({ onClose, importSessionId }: Props) {
    const [etape, setEtape] = useState(importSessionId ? 2 : 1);

    // Données de la session
    const [nomSession, setNomSession] = useState('');
    const [date, setDate] = useState('');
    const [fichier, setFichier] = useState<File | null>(null);

    // Gestions des erreurs
    const [erreur, setErreur] = useState<string | null>(null);

    // ID de la session créée (ou à importer)
    const [sessionId, setSessionId] = useState<number | null>(importSessionId ?? null);

    const navigate = useNavigate();
    const location = useLocation();

    const handleCreateSession = async () => {
        const response = await createSession({
            nom: nomSession,
            annee: parseInt(date, 10),
        });

        if (response.status !== 200 || !response.data) {
            console.error("Erreur lors de la création de la session :", response.error || "Inconnue");
            setErreur(response.error || "Inconnue");
            return;
        }

        setSessionId(response.data.id);
        setErreur(null);
        setEtape(2);
    };

    const handleUploadFile = async () => {
        if (!sessionId || !fichier) return;

        const formData = new FormData();
        formData.append("fichier", fichier);

        const response = await fetch(`${URL_API_BASE}/sessions/${sessionId}/importer/`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const message = await response.text();
            console.error(message || "Échec de l'envoi du fichier.");
            setErreur(message || "Échec de l'envoi du fichier.");
            return;
        }

        const routeCible = "/sessions/" + sessionId.toString() + "/epreuves";

        if (location.pathname === routeCible) {
            // On est déjà sur la page cible (si la session était vide, alors le modal est affiché sur la page)
            // -> on recharge !
            navigate(0);
            return;
        }

        navigate(routeCible);
    };



    return (
        <>
            <Modal onClose={etape < 2 ? onClose : undefined} titre="Nouvelle session" width="600px">
                {etape === 1 && (
                    <SessionEtapeTexte
                        nomSession={nomSession}
                        date={date}
                        setNomSession={setNomSession}
                        setDate={setDate}
                        onNext={handleCreateSession}
                    />
                )}

                {etape === 2 && (
                    <SessionEtapeTeleversement
                        fichier={fichier}
                        setFichier={setFichier}
                        onValidate={handleUploadFile}
                    />
                )}
            </Modal>

            {erreur && (
                <Snackbar open={true} autoHideDuration={10000} onClose={() => setErreur(null)}>
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {erreur}
                    </Alert>
                </Snackbar>
            )}
        </>
    );
}
