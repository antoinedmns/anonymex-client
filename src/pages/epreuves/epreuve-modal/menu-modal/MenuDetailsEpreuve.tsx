import type { APIEpreuve } from "../../../../contracts/epreuves";
import React, { useEffect } from "react";
import { Stack, Divider, Button, colors, CircularProgress, Typography } from "@mui/material";
import { EpreuveCaracteristique } from "./composantsEpreuves/EpreuveCaracteristique";
import DateTextField from "./textfields/DateTextField";
import HorairesTextField from "./textfields/HorairesTextField";
import { TypoTitre } from "../TypoTitre";
import { TypoSousTitre } from "../TypoSousTitre";
import EpreuveSallesCompo from "./composantsEpreuves/EpreuveSallesCompo";

import FolderIcon from '@mui/icons-material/Folder';

import ModalConfirmationChangements from "./composantsEpreuves/ModalConfirmationChangements";
import { updateEpreuve } from "../../../../contracts/epreuves";

import ModalConfirmationChangementsHoraire from "./composantsEpreuves/ModalConfirmationChangementsHoraire";

import { useSnackbarGlobal } from '../../../../contexts/SnackbarContext';

import { themeEpreuves } from "../../../../theme/epreuves";

import { getConvocations, postConvocationsTransfert } from "../../../../contracts/convocations";

import { useConfirmTransfer } from "./composantsListe/useConfirmTransfer";


export interface DetailsEpreuveProps {
    epreuve: APIEpreuve;
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
    console.log(date);
    const dateConvert = new Date(date);
    return dateConvert.toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' });
}




function DetailsEpreuve({ epreuve, setNumeroOnglet, setSalleDefault, setSalleDefaultNumb }: DetailsEpreuveProps) {

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

    const [salles, setSalles] = React.useState<{ nom: string, nbEtudiants: number }[]>([]);
    const [loadingSalles, setLoadingSalles] = React.useState<boolean>(true);

    const { afficherErreur } = useSnackbarGlobal()

    const { confirmTransfer, confirmModalTransfer } = useConfirmTransfer();

    useEffect(() => {
        const fetchConvocations = async () => {
            setLoadingSalles(true);
            const res = await getConvocations(epreuve.session, epreuve.code);
            if (res.data?.convocations) {
                console.log("Convocations récupérées :", res.data.convocations);
                const sallesMap: { [key: string]: number } = {};
                res.data.convocations.forEach((convocation) => {
                    if (sallesMap[convocation.codeSalle]) {
                        sallesMap[convocation.codeSalle]++;
                    } else {
                        sallesMap[convocation.codeSalle] = 1;
                    }
                });
                setSalles(Object.entries(sallesMap).map(([nom, nbEtudiants]) => ({ nom, nbEtudiants })));
                setLoadingSalles(false);
            }
        };

        fetchConvocations();
        console.log("Salles calculées :", salles);
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

        console.log("Confirmation de la nouvelle date :", newVal);
        setValIntermediaireDate(newVal);
        setModifDate(false);
        setOuvrirModalDate(true);
    }

    const handleSaveDate = async (newVal: number) => {

        console.log("Sauvegarde de la date :", newVal);

        setModifDate(false);

        console.log("Date en timestamp :", newVal);

        // Afficher chargement & erreur si besoin

        const result = await updateEpreuve(epreuve.session, epreuve.code, { date_epreuve: Math.round(newVal / 60000) });

        if (result.status == 200) {
            console.log("Mise à jour de la date réussie");
            setDateEpreuve(newVal)
        } else {
            afficherErreur("La mise à jour de la date a échoué. Veuillez réessayer.")
        }

        console.log("Résultat de la mise à jour de la date :", result)

    };


    const confirmSaveHoraire = (debut: number, fin: number) => {
        console.log("Confirmation du nouvel horaire :", debut, fin);
        setValIntermediaireHoraireDebut(debut);
        setValIntermediaireDuree((fin - debut) / (1000 * 60));

        setModifHoraire(false);
        setOuvrirModalHoraire(true);
    }

    const handleSaveHoraire = async (date: number, duree: number) => {

        setModifHoraire(false);

        console.log("Sauvegarde de l'horaire :", date, "durée :", duree);
        const result = await updateEpreuve(epreuve.session, epreuve.code, { date_epreuve: Math.round(date / 60000), duree: duree });

        if (result.status == 200) {
            console.log("Mise à jour de l'horaire réussie");
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

        const nbEtudiants = salles[0].nbEtudiants;

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
                        if (sallesDepart[0] === salle.nom) {
                            const nb = salle.nbEtudiants;

                            return {
                                ...salle,
                                nbEtudiants: salle.nbEtudiants - nb
                            };
                        }

                        if (salleArrivee === salle.nom) {
                            const salleDepart = prevSalles.find(s => s.nom === sallesDepart[0]);
                            const nb = salleDepart?.nbEtudiants ?? 0;

                            return {
                                ...salle,
                                nbEtudiants: salle.nbEtudiants + nb
                            };
                        }

                        return salle;
                    });
                });

            }
            console.log("Résultat de la confirmation de transfert :", result);

        }
    };

    const handleAjout = (salle: string) => {
        console.log("Ajout demandé");
        //setSalleDefaultNumb(salles.findIndex(s => s.nom === salle) ?? 0);
        setNumeroOnglet(3);
    }

    const handleDetails = (salle: string) => {
        console.log("Détails demandés pour la salle :", salle);
        setSalleDefault(salle);
        setNumeroOnglet(1);
    }


    return (

        <>
            {confirmModalTransfer}

            <ModalConfirmationChangements ouvert={ouvrirModalDate} setOuvert={setOuvrirModalDate} handleSave={handleSaveDate} oldVal={dateEpreuve} newVal={valIntermediaireDate} type="date" />
            <ModalConfirmationChangementsHoraire ouvert={ouvrirModalHoraire} setOuvert={setOuvrirModalHoraire} handleSave={handleSaveHoraire} ancien={{ date: dateEpreuve, duree: dureeMinutes }} nouveau={{ date: valIntermediaireHoraireDebut, duree: valIntermediaireDuree }} />


            <Stack spacing={4} direction="row" p={2} >
                <Stack width={"40%"} spacing={3}>
                    <EpreuveCaracteristique titre="Épreuve à venir" sousTitre={nomEpreuve} fonctionModif={handleModifEpreuve} modif={modifEpreuve} color={themeEpreuves.status[epreuve.statut]} />
                    <EpreuveCaracteristique titre="Date" sousTitre={formatDate(dateEpreuve)} fonctionModif={handleModifDate} modif={modifDate} AdaptedTextField={() => (<DateTextField date={dateEpreuve} fonctionSave={confirmSaveDate} />)} color={themeEpreuves.status[epreuve.statut]} />
                    <EpreuveCaracteristique titre="Horaires" sousTitre={calcHoraires(dateEpreuve, dureeMinutes)} fonctionModif={handleModifHoraire} modif={modifHoraire} AdaptedTextField={() => (<HorairesTextField date={dateEpreuve} dureeMinutes={dureeMinutes} fonctionSave={confirmSaveHoraire} />)} color={themeEpreuves.status[epreuve.statut]} />
                    <EpreuveCaracteristique titre="Nombre inscrits" sousTitre={nbInscritsEpreuve} fonctionModif={handleModifNbInscrits} modif={modifNbInscrits} color={themeEpreuves.status[epreuve.statut]} />
                    <Stack>
                        <Button variant="contained" sx={{ bgcolor: themeEpreuves.status[epreuve.statut] + "60", color: colors.grey[900], py: 1, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }} startIcon={<FolderIcon sx={{ color: colors.grey[800] }} />}>
                            Réimporter depuis le tableur
                        </Button>
                    </Stack>
                </Stack>

                <Divider orientation="vertical" flexItem />

                <Stack width={"60%"}  >
                    <TypoTitre>Répartition des étudiants</TypoTitre>
                    <Stack sx={{ height: 35 }} >
                        <TypoSousTitre >Cliquez pour afficher la composition</TypoSousTitre>
                    </Stack>
                    <Stack spacing={1} pt={3} height={400} overflow="auto" pr={2}>
                        {loadingSalles ? (
                            <CircularProgress />
                        ) : salles.length === 0 ? (
                            <Typography variant="body1" color={colors.grey[700]}>
                                Aucune salle trouvée pour cette épreuve.
                            </Typography>
                        ) : (
                            salles.map((salle) => (
                                (salle.nbEtudiants > 0) && (
                                    <EpreuveSallesCompo key={salle.nom} salle={salle.nom} sallesDispo={salles} nbEtudiants={salle.nbEtudiants} nbEtuMMax={epreuve.copiesTotal ? epreuve.copiesTotal : 0} color={themeEpreuves.status[epreuve.statut]} onTransfert={handleTransfert} onAjouter={handleAjout} onDetails={handleDetails} />
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