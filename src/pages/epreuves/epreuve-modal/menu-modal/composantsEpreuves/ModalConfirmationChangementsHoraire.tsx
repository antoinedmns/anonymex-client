import ModalConfirmationBase from "./ModalConfirmationBase";

interface ModalConfirmationChangementsProps {
    ouvert: boolean;
    setOuvert: (ouvert: boolean) => void;
    handleSave: (date: number, duree: number) => void;
    ancien: { date: number, duree: number };
    nouveau: { date: number, duree: number };
}


function formatHoraire(date: number, duree: number): string {
    const dateConvert = new Date(date);
    const dateFin = new Date(dateConvert.getTime() + duree * 60000);

    return (
        dateConvert.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) +
        " - " +
        dateFin.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    );
}


function ModalConfirmationChangementsHoraire({ ouvert, setOuvert, handleSave, ancien, nouveau }: ModalConfirmationChangementsProps) {
    const onClose = () => {
        setOuvert(false);
    };

    const onConfirmer = () => {
        handleSave(nouveau.date, nouveau.duree);
        setOuvert(false);
    };

    return (
        <ModalConfirmationBase
            ouvert={ouvert}
            onClose={onClose}
            onConfirmer={onConfirmer}
            titre="Confirmer la modification d'horaire"
            ancienLabel="Horaire actuel"
            ancienValeur={formatHoraire(ancien.date, ancien.duree)}
            nouveauLabel="Nouvel horaire"
            nouveauValeur={formatHoraire(nouveau.date, nouveau.duree)}
            texteConfirmation="Confirmer le changement"
            texteAnnulation="Annuler"
        />
    );
}

export default ModalConfirmationChangementsHoraire;