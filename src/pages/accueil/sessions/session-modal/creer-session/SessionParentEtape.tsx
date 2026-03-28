import { useState } from "react";
import SessionEtapeTexte from "./SessionEtapeTexte";
import SessionEtapeBordereau from "./SessionEtapeBordereau";
import SessionEtapeTeleversement from "./SessionEtapeTeleversement";
import { Modal } from "../../../../../components/Modal";
import { createSession } from "../../../../../contracts/sessions";
import { URL_API_BASE } from "../../../../../utils/api";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";

type Props = {
    onClose: () => void;
};

export default function SessionParentEtape({onClose}: Props) {
    const [etape, setEtape] = useState(1);

    // Données globales
    const [nomSession, setNomSession] = useState('');
    const [date, setDate] = useState('');
    const [bordereau, setBordereau] = useState(null);
    const [fichier, setFichier] = useState<File | null>(null);

    // Gestions des erreurs
    const [erreur, setErreur] = useState<string | null>(null);

    const [sessionId, setSessionId] = useState<number | null>(null);

    const navigate = useNavigate();

    const prev = () => setEtape((e) => e - 1);

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
        setEtape(3);
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
            return;
        }

        navigate("/sessions/" + sessionId.toString() + "/epreuves");
    };



    return (
        <>
            <Modal onClose={etape < 3 ? onClose : undefined} titre="Nouvelle session" width="600px">
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
                    <SessionEtapeBordereau
                        bordereau={bordereau}
                        setBordereau={setBordereau}
                        onPrev={prev}
                        onNext={handleCreateSession}          
                    />
                )}

                {etape === 3 && (
                    <SessionEtapeTeleversement
                        fichier={fichier}
                        setFichier={setFichier}
                        onValidate={handleUploadFile}
                    />
                )}

                {erreur && (
                    <Alert severity="error">
                        {erreur}
                    </Alert>
                )}
            </Modal>
        </>
    );
}
