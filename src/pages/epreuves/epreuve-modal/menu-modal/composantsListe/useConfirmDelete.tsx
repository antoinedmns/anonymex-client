import { useState } from 'react';
import ModalConfirmationBase from '../composantsEpreuves/ModalConfirmationBase';


export function useConfirmDelete() {
    const [ouvert, setOuvert] = useState(false);
    const [students, setStudents] = useState<string[]>([]);

    const [resolver, setResolver] = useState<((value: string[]) => void) | null>(null);


    const confirmDelete = (nextStudents: string[]): Promise<string[]> => {
        setStudents(nextStudents);
        setOuvert(true);

        return new Promise(resolve => {
            setResolver(() => resolve);
        });
    };

    const handleClose = (value: string[]) => {
        setOuvert(false);
        resolver?.(value);
        setResolver(null);
    };

    const nbStudents = students.length;

    return {
        confirmDelete,
        confirmModalDelete:
            <ModalConfirmationBase
                ouvert={ouvert}
                onClose={() => {
                    handleClose([]);
                }}
                onConfirmer={() => {
                    handleClose(students);
                }}
                titre="Confirmer la suppression"
                ancienLabel="Étudiants sélectionnés"
                ancienValeur={`${nbStudents} étudiant${nbStudents > 1 ? 's' : ''}`}
                nouveauLabel="Action"
                nouveauValeur="Suppression"
                texteConfirmation="Confirmer la suppression"
                texteAnnulation="Annuler"
            />

    };
}
