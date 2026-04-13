import type { APIEpreuve } from "../../../../contracts/epreuves";
import React, { useEffect } from "react";
import { Stack, Divider, colors, Typography } from "@mui/material";
import { EpreuveCaracteristique } from "./composantsEpreuves/EpreuveCaracteristique";
import DateTextField from "./textfields/DateTextField";
import HorairesTextField from "./textfields/HorairesTextField";
import { TypoTitre } from "../TypoTitre";
import { TypoSousTitre } from "../TypoSousTitre";
import EpreuveSallesCompo from "./composantsEpreuves/EpreuveSallesCompo";
import ModalConfirmationChangements from "./composantsEpreuves/ModalConfirmationChangements";
import { getSallesEpreuve, updateEpreuve } from "../../../../contracts/epreuves";
import ModalConfirmationChangementsHoraire from "./composantsEpreuves/ModalConfirmationChangementsHoraire";
import { useSnackbarGlobal } from '../../../../contexts/SnackbarContext';
import { postConvocationsTransfert } from "../../../../contracts/convocations";
import { useConfirmTransfer } from "./composantsListe/useConfirmTransfer";
import BoutonStandard from "../components/BoutonStantard";
import { URL_API_BASE } from "../../../../utils/api";
import { themeEpreuves } from "../../../../theme/epreuves";
import { BackupTable, FileDownload } from "@mui/icons-material";
import { useEpreuvesCache } from "../../../../contexts/EpreuvesCacheContext";

export interface DetailsEpreuveProps {
    epreuve: APIEpreuve;
    statut: number;
    setNumeroOnglet: (value: 0 | 1 | 2 | 3 | 4) => void;
    setSalleDefault: (value: string) => void;
    setSalleDefaultNumb: (value: number) => void;
}

function calcHoraires(date: number, dureeMinutes: number): string {
    const dateConvert = new Date(date);

    const dateDebut = new Date(dateConvert.setHours(dateConvert.getHours(), dateConvert.getMinutes()));
    const dateFin = new Date(dateConvert.setHours(dateConvert.getHours(), dateConvert.getMinutes() + dureeMinutes));

    return dateDebut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + dateFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: number): string {
    const dateConvert = new Date(date);
    return dateConvert.toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' });
}

function DetailsEpreuve({ epreuve, setNumeroOnglet, setSalleDefault, statut }: DetailsEpreuveProps) {

    const [modifEpreuve, setModifEpreuve] = React.useState<boolean>(false);
    const [modifDate, setModifDate] = React.useState<boolean>(false);
    const [modifHoraire, setModifHoraire] = React.useState<boolean>(false);
    const [modifNbInscrits, setModifNbInscrits] = React.useState<boolean>(false);

    const [nomEpreuve] = React.useState<string>(epreuve.nom ? epreuve.nom : "Épreuve sans nom");

    const [dateEpreuve, setDateEpreuve] = React.useState<number>(epreuve.date ? epreuve.date : 0);

    const [dureeMinutes, setDureeMinutes] = React.useState<number>(epreuve.duree ? epreuve.duree : 0);

    const [nbInscritsEpreuve] = React.useState<string>(epreuve.copiesTotal ? (`${epreuve.copiesTotal} inscrits`) : "Aucun inscrit");

    const [ouvrirModalDate, setOuvrirModalDate] = React.useState<boolean>(false);
    const [ouvrirModalHoraire, setOuvrirModalHoraire] = React.useState<boolean>(false);

    const [valIntermediaireDate, setValIntermediaireDate] = React.useState<number>(0);
    const [valIntermediaireDuree, setValIntermediaireDuree] = React.useState<number>(0);
    const [valIntermediaireHoraireDebut, setValIntermediaireHoraireDebut] = React.useState<number>(0);

    const [salles, setSalles] = React.useState<{ codeSalle: string, convocations: number }[]>([]);
    const [reimportOuvert, setReimportOuvert] = React.useState<boolean>(false);

    const { afficherErreur } = useSnackbarGlobal()
    const { patchEpreuve } = useEpreuvesCache();

    const { confirmTransfer, confirmModalTransfer } = useConfirmTransfer();

    const couleurStatusEpreuve = themeEpreuves.status[epreuve.statut];

    useEffect(() => {
        const fetchConvocations = async () => {
            const res = await getSallesEpreuve(epreuve.session, epreuve.code);
            if (res.data) setSalles(res.data);
        };

        fetchConvocations();
    }, [epreuve.session, epreuve.code]);

    const handleModifEpreuve = () => {
        setModifEpreuve(true);
    };
    const handleModifDate = () => {
        setModifDate(true);
    };
    const handleModifHoraire = () => {
        setModifHoraire(true);
    };
    const handleModifNbInscrits = () => {
        setModifNbInscrits(true);
    };



    const confirmSaveDate = (newVal: number) => {
        setValIntermediaireDate(newVal);
        setModifDate(false);
        setOuvrirModalDate(true);
    }

    const handleSaveDate = async (newVal: number) => {
        setModifDate(false);

        const result = await updateEpreuve(epreuve.session, epreuve.code, { date_epreuve: Math.round(newVal / 60000) });

        if (result.status == 200) {
            console.log("Mise à jour de la date réussie");
            patchEpreuve(epreuve.code, { date: newVal });
            setDateEpreuve(newVal);
        } else {
            afficherErreur("La mise à jour de la date a échoué. Veuillez réessayer.")
        }

    };


    const confirmSaveHoraire = (debut: number, fin: number) => {
        setValIntermediaireHoraireDebut(debut);
        setValIntermediaireDuree((fin - debut) / (1000 * 60));

        setModifHoraire(false);
        setOuvrirModalHoraire(true);
    }

    const handleSaveHoraire = async (date: number, duree: number) => {

        setModifHoraire(false);

        const result = await updateEpreuve(epreuve.session, epreuve.code, { date_epreuve: Math.round(date / 60000), duree: duree });

        if (result.status == 200) {
            console.log("Mise à jour de l'horaire réussie");
            patchEpreuve(epreuve.code, { date, duree });
            setDateEpreuve(date);
            setDureeMinutes(duree);

        } else {
            afficherErreur("La mise à jour de l'horaire a échoué. Veuillez réessayer.")
        }
        console.log("Résultat de la mise à jour de la durée :", result)

    };

    {/* 

    const handleSaveEpreuve = (newVal: string) => {
        setNomEpreuve(newVal);
        setModifEpreuve(false);
    };

    const handleSaveNbInscrits = (newVal: string) => {
        setNbInscritsEpreuve(newVal);
        setModifNbInscrits(false);
    };

    */}

    const handleTransfert = async (sallesDepart: string[], salleArrivee: string) => {

        const nbEtudiants = salles[0].convocations;

        const result = await confirmTransfer(nbEtudiants, salleArrivee);

        console.log("Salle de départ :", sallesDepart);
        console.log("Salle d'arrivée :", salleArrivee);

        if (result) {

            const res = await postConvocationsTransfert(epreuve.session, epreuve.code, { sallesDepart: sallesDepart, salleTransfert: salleArrivee });
            console.log("Réponse de l'API après transfert :", res);
            if (res.data?.success) {
                console.log(`Transfert des étudiants des salles ${sallesDepart} vers la salle ${salleArrivee} réussi`);
                setSalles((prevSalles) => {
                    return prevSalles.map((salle) => {
                        if (sallesDepart[0] === salle.codeSalle) {
                            const nb = salle.convocations;

                            return {
                                ...salle,
                                nbEtudiants: salle.convocations - nb
                            };
                        }

                        if (salleArrivee === salle.codeSalle) {
                            const salleDepart = prevSalles.find(s => s.codeSalle === sallesDepart[0]);
                            const nb = salleDepart?.convocations ?? 0;

                            return {
                                ...salle,
                                nbEtudiants: salle.convocations + nb
                            };
                        }

                        return salle;
                    });
                });

            }

        }
    };

    const handleAjout = () => {
        setNumeroOnglet(3);
    }

    const handleDetails = (salle: string) => {
        setSalleDefault(salle);
        setNumeroOnglet(1);
    }

    const handleExport = () => {
        const url = `${URL_API_BASE}/documents/session/${epreuve.session}/epreuve/${epreuve.code}/notes?format=xlsx`;
        window.open(url, '_blank');
    }

    const handleReimport = () => {
        setReimportOuvert(true);
    }

    return (

        <>
            {confirmModalTransfer}
            {reimportOuvert && (
                {}
            )}
            <ModalConfirmationChangements ouvert={ouvrirModalDate} setOuvert={setOuvrirModalDate} handleSave={handleSaveDate} oldVal={dateEpreuve} newVal={valIntermediaireDate} type="date" />
            <ModalConfirmationChangementsHoraire ouvert={ouvrirModalHoraire} setOuvert={setOuvrirModalHoraire} handleSave={handleSaveHoraire} ancien={{ date: dateEpreuve, duree: dureeMinutes }} nouveau={{ date: valIntermediaireHoraireDebut, duree: valIntermediaireDuree }} />


            <Stack spacing={4} direction="row" p={2} >
                <Stack width={"40%"} spacing={3}>
                    <EpreuveCaracteristique titre="Épreuve à venir" sousTitre={nomEpreuve} fonctionModif={handleModifEpreuve} modif={modifEpreuve} color={couleurStatusEpreuve} />
                    <EpreuveCaracteristique titre="Date" sousTitre={formatDate(dateEpreuve)} fonctionModif={handleModifDate} modif={modifDate} AdaptedTextField={() => (<DateTextField date={dateEpreuve} fonctionSave={confirmSaveDate} />)} color={couleurStatusEpreuve} />
                    <EpreuveCaracteristique titre="Horaires" sousTitre={calcHoraires(dateEpreuve, dureeMinutes)} fonctionModif={handleModifHoraire} modif={modifHoraire} AdaptedTextField={() => (<HorairesTextField date={dateEpreuve} dureeMinutes={dureeMinutes} fonctionSave={confirmSaveHoraire} />)} color={couleurStatusEpreuve} />
                    <EpreuveCaracteristique titre="Nombre inscrits" sousTitre={nbInscritsEpreuve} fonctionModif={handleModifNbInscrits} modif={modifNbInscrits} color={couleurStatusEpreuve} />
                    <Stack spacing={1}>
                        {/*<BoutonStandard onClick={handleReimport} height={50} color={couleurStatusEpreuve} icone={<BackupTable sx={{ color: colors.grey[800] }} />}>
                            Réimporter depuis le tableur
                        </BoutonStandard>*/}
                        {statut > 2 && (
                            <BoutonStandard onClick={handleExport} height={50} color={couleurStatusEpreuve} icone={<FileDownload sx={{ color: colors.grey[800] }} />}>
                                Exporter les notes
                            </BoutonStandard>
                        )}
                    </Stack>
                </Stack>

                <Divider orientation="vertical" flexItem />

                <Stack width={"60%"}  >
                    <TypoTitre>Répartition des étudiants</TypoTitre>
                    <Stack sx={{ height: 35 }} >
                        <TypoSousTitre >Cliquez pour afficher la composition</TypoSousTitre>
                    </Stack>
                    <Stack spacing={1} pt={3} height={400} overflow="auto" pr={2}>
                        {salles.length === 0 ? (
                            <Typography variant="body1" color={colors.grey[700]}>
                                Aucune salle trouvée pour cette épreuve.
                            </Typography>
                        ) : (
                            // TODO: un composant listeSalles qui gere le chargement, le transfert et tt la logique
                            salles.map((salle) => (
                                (salle.convocations > 0) && (
                                    <EpreuveSallesCompo key={salle.codeSalle} salle={salle.codeSalle} sallesDispo={salles} nbEtudiants={salle.convocations} nbEtuMMax={epreuve.copiesTotal ? epreuve.copiesTotal : 0} color={couleurStatusEpreuve} onTransfert={handleTransfert} onAjouter={handleAjout} onDetails={handleDetails} />
                                )
                            ))
                        )
                        }

                    </Stack>
                </Stack>
            </Stack>
        </>
    );
}

export default DetailsEpreuve;