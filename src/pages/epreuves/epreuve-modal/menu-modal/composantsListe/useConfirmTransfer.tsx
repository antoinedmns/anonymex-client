import { useState } from 'react';
import ModalConfirmationBase from '../composantsEpreuves/ModalConfirmationBase';


export function useConfirmTransfer() {
    const [ouvert, setOuvert] = useState(false);
    const [salle, setSalle] = useState<string>("");
    const [nbStudents, setNbStudents] = useState<number>(0);

    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);


    const confirmTransfer = (nbEtudiants: number, salleDestination: string): Promise<boolean> => {
        setNbStudents(nbEtudiants);
        setSalle(salleDestination);
        setOuvert(true);

        return new Promise(resolve => {
            setResolver(() => resolve);
        });
    };

    const handleClose = (value: boolean) => {
        setOuvert(false);
        resolver?.(value);
        setResolver(null);
    };

    return {
        confirmTransfer,
        confirmModalTransfer:
            <ModalConfirmationBase
                ouvert={ouvert}
                onClose={() => {
                    handleClose(false);
                }}
                onConfirmer={() => {
                    handleClose(true);
                }}
                titre="Confirmer le transfert"
                ancienLabel="Étudiants sélectionnés"
                ancienValeur={`${nbStudents} étudiant${nbStudents > 1 ? 's' : ''}`}
                nouveauLabel="Salle de destination"
                nouveauValeur={salle || 'Aucune salle'}
                texteConfirmation="Confirmer le transfert"
                texteAnnulation="Annuler"
            />

    };
}
