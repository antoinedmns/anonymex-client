import { Alert, Box, Stack } from "@mui/material";
import { SessionModalBouton } from "../composantsFormulaireSession";
import React, { useState } from "react";
import { Check } from "@mui/icons-material";
import { DropZone } from "../../../../epreuves/epreuve-modal/components/DepotCopies/DropZone";

type Props = {
    fichier: File | null;
    setFichier: (f: File | null) => void;
    onValidate: () => Promise<void>;
};

export default function SessionEtapeTeleversement({ fichier, setFichier, onValidate }: Props) {

    const [isLoading, setIsLoading] = useState(false);

    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            await onValidate();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Stack component="form" onSubmit={handleSubmit} justifyContent={'space-between'} flexDirection={'column'} spacing={2} margin={4}>

                <DropZone
                    title=" "
                    subtitle="Veuillez importer un fichier Excel (.xlsx) contenant les données nécessaires à la création de la session."
                    inputRef={inputRef}
                    setFichiers={(files) => setFichier(files ? files[0] : null)}
                    fichiers={null}
                    formatAcceptes={['xlsx']}
                />

                {fichier && fichier.name.endsWith(".xlsx") && (
                    <Alert severity="success">Fichier sélectionné : {fichier.name}</Alert>
                )}

                <Box mt={1} />
                <SessionModalBouton label="Importer les données" loading={isLoading} endIcon={<Check />} disabled={!fichier} />

            </Stack>
        </>
    );
}
