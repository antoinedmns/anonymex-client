import ModalConfirmationBase from "./ModalConfirmationBase";

interface ModalConfirmationChangementsProps {
    ouvert: boolean;
    setOuvert: (ouvert: boolean) => void;
    handleSave: (newVal: number) => void;
    oldVal: number;
    newVal: number;
    type?: "date" | "horaire";
}


function formatDate(date: number): string {
    const dateConvert = new Date(date);
    return dateConvert.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

function formatHoraire(date: number): string {
    const dateConvert = new Date(date);
    return dateConvert.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatValeur(valeur: number, type: "date" | "horaire"): string {
    return type === "date" ? formatDate(valeur) : formatHoraire(valeur);
}

function ModalConfirmationChangements({ ouvert, setOuvert, handleSave, oldVal, newVal, type }: ModalConfirmationChangementsProps) {
    const typeChangement = type ?? "date";
    const titre = typeChangement === "date" ? "Confirmer la modification de date" : "Confirmer la modification d'horaire";
    const ancienLabel = typeChangement === "date" ? "Date actuelle" : "Horaire actuel";
    const nouveauLabel = typeChangement === "date" ? "Nouvelle date" : "Nouvel horaire";

    const onClose = () => {
        setOuvert(false);
    };

    const onConfirmer = () => {
        handleSave(newVal);
        setOuvert(false);
    };

    return (
        <ModalConfirmationBase
            ouvert={ouvert}
            onClose={onClose}
            onConfirmer={onConfirmer}
            titre={titre}
            ancienLabel={ancienLabel}
            ancienValeur={formatValeur(oldVal, typeChangement)}
            nouveauLabel={nouveauLabel}
            nouveauValeur={formatValeur(newVal, typeChangement)}
            texteConfirmation="Confirmer le changement"
            texteAnnulation="Annuler"
        />
    );
}

export default ModalConfirmationChangements;