import { useCallback, useEffect, useMemo, useState, useTransition, type ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type APIEpreuve } from "../../contracts/epreuves";
import { Box, Divider, Snackbar, Stack, Typography, Alert, Button } from "@mui/material";
import { useSnackbarGlobal } from "../../contexts/SnackbarContext";
import { EpreuveCard } from "./EpreuveCard";
import { formatterDateEntiere } from "../../utils/dateUtils";
import SearchBar from "../../components/SearchBar";
import EpreuvesFiltreCard from "./EpreuvesFiltreCard";
import { blue, grey, lightGreen, purple, teal } from "@mui/material/colors";
import { themeEpreuves } from "../../theme/epreuves";
import { Download, Folder } from "@mui/icons-material";
import { useModal } from "../../contexts/ModalContext";
import { EpreuveModal } from "./epreuve-modal/EpreuveModal";
import BoutonImportant from "./epreuve-modal/components/BoutonImportant";
import { BordereauxModal } from "./epreuve-modal/BordereauxModal";
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { ScanModal } from "./epreuve-modal/ScanModal"
import { useEpreuvesCache } from "../../contexts/EpreuvesCacheContext";

export type SortOption = "chronologique" | "inverse-chronologique";


export default function EpreuvesPage(): ReactElement {

    console.log("Rendu de EpreuvesPage");

    const { epreuves: listeEpreuves, estChargement, erreurChargement } = useEpreuvesCache();

    // Filtres et tri
    const [typeEpreuve, setTypeEpreuve] = useState<'passees' | 'aVenir'>('aVenir');
    const [filtreStatut, setFiltreStatut] = useState<number | null>(null); // null => tout afficher
    //const [optionTri] = useState<SortOption>("chronologique");

    // Transitions afin de fluidifier les mises à jour d'état
    const [, demarrerTransition] = useTransition();

    // Contexte de snackbar pour afficher les erreurs
    const { afficherErreur } = useSnackbarGlobal();

    // Modal imprimer bordereaux
    const [ouvertModal, setOuvertModal] = useState(false);

    // Modal scan
    const [ouvertModalScan, setOuvertModalScan] = useState(false);

    // Afficher snackbar de succès après le scan
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false)
    const [codeScan, setCodeScan] = useState<string>("");

    // Modal
    const { ouvrir } = useModal();

    // Navigation
    const navigate = useNavigate();

    // Paramètres d'URL
    const { sessionId } = useParams<{ sessionId: string }>();


    useEffect(() => {
        if (erreurChargement) {
            afficherErreur("Impossible de charger les épreuves : " + erreurChargement);
        }
    }, [afficherErreur, erreurChargement]);


    // lorsqu'une épreuve est cliquée : afficher modal
    const handleEpreuveClick = useCallback((epreuve: APIEpreuve) => {
        if (sessionId === undefined) return;
        console.log("Épreuve cliquée :", epreuve);
        ouvrir(<EpreuveModal codeEpreuve={epreuve.code} sessionId={sessionId} />);
    }, [ouvrir, sessionId]);

    // lorsque le filtre de type d'épreuve change
    const handleTypeEpreuveChange = (newType: 'passees' | 'aVenir') => {
        if (typeEpreuve === newType) return;
        demarrerTransition(() => {
            setTypeEpreuve(newType);
            if (filtreStatut !== null) setFiltreStatut(null);
        });
    };

    // lorsque le filtre de statut change
    const handleStatutChange = (newStatut: number | null) => {
        if (newStatut === filtreStatut) return;
        demarrerTransition(() => setFiltreStatut(newStatut));
    };

    // calculer les épreuves à afficher selon les filtres et le tri
    const { epreuvesAffichees, statutMap } = useMemo(() => {
        const epreuvesSource = typeEpreuve === 'aVenir' ? listeEpreuves.epreuvesAvenir : listeEpreuves.epreuvesPassees;

        //const triSens = optionTri === 'chronologique' ? 1 : -1;
        //const epreuvesTriees = [...epreuvesFiltres].sort((a, b) => (a.date - b.date) * triSens);

        const compteursStatus = new Map<number, number>();

        const resultat: (APIEpreuve | number)[] = [];
        let derniereDateGroupe: number | null = null;

        for (let i = 0; i < epreuvesSource.length; i++) {
            const epreuve = epreuvesSource[i];
            const dateEntiere = Math.floor(epreuve.date / 86400000);
            compteursStatus.set(epreuve.statut, (compteursStatus.get(epreuve.statut) ?? 0) + 1);

            if (filtreStatut !== null && epreuve.statut !== filtreStatut) continue;

            if (derniereDateGroupe !== dateEntiere) {
                resultat.push(dateEntiere);
                derniereDateGroupe = dateEntiere;
            }

            resultat.push(epreuve);
        }

        return { epreuvesAffichees: resultat, statutMap: compteursStatus };
    }, [listeEpreuves, typeEpreuve, filtreStatut]);


    const handleImprimerBordereaux = () => {
        setOuvertModal(true);
    }

    const handleScan = () => {
        setOuvertModalScan(true);
    }

    if (!sessionId) return <Typography variant="h5" color="error">ID de session manquant dans l'URL.</Typography>;

    return (
        <Box p={3}>
            <SearchBar onResultClick={handleEpreuveClick} sessionId={+sessionId} />

            { /* Page séparée en deux colonnes : liste des épreuves à gauche, filtres et options de tri à droite */}
            <Stack direction={"row"} justifyContent={"center"}>
                <Stack sx={{ width: '85vw', paddingTop: 4 }} spacing={4} direction={"row"}
                    justifyContent={"space-between"} alignItems={"flex-start"} divider={<Divider orientation="vertical" flexItem />}>

                    <Box sx={{ width: '65%' }}>
                        { /* LISTE DES ÉPREUVES */}
                        {estChargement ? (
                            <Typography>Chargement des épreuves...</Typography>
                        ) : (
                            <Stack spacing={2}>
                                {epreuvesAffichees.map((epreuve) => (
                                    typeof epreuve === "number" ? (
                                        <Typography key={epreuve} variant="h5" paddingTop={3} fontWeight={700}>{formatterDateEntiere(epreuve)}</Typography>
                                    ) : (
                                        <EpreuveCard key={epreuve.code + epreuve.date} epreuve={epreuve} onClick={handleEpreuveClick} />
                                    )
                                ))}
                            </Stack>
                        )}
                    </Box>
                    <Box sx={{ width: '35%' }}>
                        { /* FILTRES ET OPTIONS DE TRI */}
                        <Stack spacing={2}>
                            <Typography variant="h5" paddingTop={3} fontWeight={700}>Filtres</Typography>
                            <EpreuvesFiltreCard couleur={purple[300]} titre="Épreuves à venir" nombre={listeEpreuves.epreuvesAvenir.length} selectionne={typeEpreuve === 'aVenir'} onClick={() => handleTypeEpreuveChange('aVenir')} />
                            <EpreuvesFiltreCard couleur={blue[300]} titre="Épreuves passées" nombre={listeEpreuves.epreuvesPassees.length} selectionne={typeEpreuve === 'passees'} onClick={() => handleTypeEpreuveChange('passees')} />
                        </Stack>

                        <Stack spacing={2}>
                            <Typography variant="h5" paddingTop={5} fontWeight={700}>Statuts</Typography>
                            <EpreuvesFiltreCard couleur={themeEpreuves.status[0]} titre="Tout afficher" sousTexte="Afficher tous les statuts." icone={<Folder sx={{ color: grey[700] }} fontSize="large" />} selectionne={filtreStatut === null} onClick={() => handleStatutChange(null)} />
                            {statutMap.get(1) && <EpreuvesFiltreCard couleur={themeEpreuves.status[1]} titre="Matériel non imprimé" sousTexte="Examens pour lesquels le matériel n’a pas été imprimé." nombre={statutMap.get(1)} selectionne={filtreStatut === 1} onClick={() => handleStatutChange(1)} />}
                            {statutMap.get(2) && <EpreuvesFiltreCard couleur={themeEpreuves.status[2]} titre="Materiel imprimé" sousTexte="Examens pour lesquels le matériel a été imprimé." nombre={statutMap.get(2)} selectionne={filtreStatut === 2} onClick={() => handleStatutChange(2)} />}
                            {statutMap.get(3) && <EpreuvesFiltreCard couleur={themeEpreuves.status[3]} titre="En attente de dépot" sousTexte="Examens en attente de dépôt des copies." nombre={statutMap.get(3)} selectionne={filtreStatut === 3} onClick={() => handleStatutChange(3)} />}
                            {statutMap.get(4) && <EpreuvesFiltreCard couleur={themeEpreuves.status[4]} titre="Dépot complet" sousTexte="Examens pour lesquels toutes les copies ont été déposées." nombre={statutMap.get(4)} selectionne={filtreStatut === 4} onClick={() => handleStatutChange(4)} />}
                            {statutMap.get(5) && <EpreuvesFiltreCard couleur={themeEpreuves.status[5]} titre="Notes exportées" sousTexte="Afficher les examens pour lesquels les notes ont été exportées." nombre={statutMap.get(5)} selectionne={filtreStatut === 5} onClick={() => handleStatutChange(5)} />}
                        </Stack>



                        <Stack spacing={2}>
                            <Typography variant="h5" paddingTop={5} fontWeight={700}>Actions</Typography>
                            <BoutonImportant color={teal[400]} titre="Imprimer les bordereaux" icone={<Download sx={{ color: grey[800] }} fontSize="large" />} onClick={() => handleImprimerBordereaux()} />
                            <BoutonImportant color={lightGreen[400]} titre="Déposer des scans" icone={<DocumentScannerIcon sx={{ color: grey[800] }} fontSize="large" />} onClick={() => handleScan()} />
                        </Stack>
                        <BordereauxModal ouvert={ouvertModal} onFermer={() => setOuvertModal(false)} />
                        <ScanModal setSuccess={setOpenSnackbar} idSession={sessionId} ouvert={ouvertModalScan} setOuvertModalScan={setOuvertModalScan} setCodeScan={setCodeScan} />

                        <Snackbar
                            open={openSnackbar}
                            autoHideDuration={6000}
                            onClose={() => setOpenSnackbar(false)}

                        >
                            <Alert
                                severity="success"
                                onClose={() => setOpenSnackbar(false)}
                                variant="filled"

                                action={
                                    <Button
                                        color="inherit"
                                        onClick={() =>
                                            navigate(`/sessions/${sessionId}/epreuves?ue=${codeScan}&tab=scan`)
                                        }
                                    >
                                        Voir
                                    </Button>
                                }
                                sx={{ width: "100%" }}
                            >
                                Scans déposés avec succès !
                            </Alert>
                        </Snackbar>
                    </Box>
                </Stack>
            </Stack>
        </Box>
    );

}
