import { Alert, Box, colors, Input, Stack, Typography } from "@mui/material";
import { SessionModalBouton } from "../composantsFormulaireSession";
import React, { useState } from "react";
import { Check } from "@mui/icons-material";

type Props = {
    fichier: File | null;
    setFichier: (f: File | null) => void;
    onValidate: () => Promise<void>;
};

export default function SessionEtapeTeleversement({fichier,setFichier,onValidate}: Props) {

    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);


    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            setError("Aucun fichier sélectionné.");
            setFichier(null);
            return;
        }

        const isXlsx = file.name.toLowerCase().endsWith(".xlsx");

        if (!isXlsx) {
            setError("Veuillez importer un fichier Excel (.xlsx).");
            setFichier(null);
            return;
        }

        setError(null);
        setFichier(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fichier) {
            setError("Veuillez sélectionner un fichier XLSX.");
            return;
        }

        setIsLoading(true);
        await onValidate();
        setIsLoading(false);
    };

    return (
        <Stack component="form" onSubmit={handleSubmit} justifyContent={'space-between'} flexDirection={'column'} gap={2} margin={4}>
            <Typography variant="body1">Veuillez téléverser un fichier XLSX ci-dessous pour finaliser la création.</Typography>

            <Input type='file'  inputProps={{ accept: '.xlsx' }} onChange={handleUpload} sx={{
                border: '3px dashed', borderColor: colors.blue[400], padding: '1.5rem', borderRadius: 3, '&:before': { border: 'none', position: 'initial' }, '&:before:hover': { border: 'none' } }}></Input>

            {error && <Alert sx={{ mt: 1 }}severity="error">{error}</Alert>}

        <Box mt={1} />
        <SessionModalBouton label="Importer les données" loading={isLoading} endIcon={<Check />} disabled={!fichier}/>
        
        </Stack>
    );
}
