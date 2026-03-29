import { Autocomplete, Box, Button, Stack, TextField, Typography } from "@mui/material";
import React from "react";

type AnonymatCardProps = {
    codeAnonymat: string;
}

export default function AnonymatCard({ codeAnonymat }: AnonymatCardProps) {

    const [value, setValue] = React.useState<{ numeroEtudiant: number; nom: string; prenom: string } | null>(null);

    const etudiantsExemple = [
        { numeroEtudiant: 12345, nom: "Dupont", prenom: "Jean" },
        { numeroEtudiant: 67890, nom: "Durand", prenom: "Marie" },
        { numeroEtudiant: 54321, nom: "Martin", prenom: "Pierre" },
    ];

    return (
        <>
            <Stack direction="row" spacing={2} alignItems="center">
                {/* Première partie de la carte d'anonymat (code d'anonymat) */}
                <Typography variant="h6" fontWeight={'bold'}>
                    {codeAnonymat}
                </Typography>

                {/* Deuxième partie de la carte d'anonymat (étudiant associé) */}
                <Autocomplete
                    sx={{ width: 320 }}
                    options={etudiantsExemple}
                    value={value}
                    onChange={(_, newValue) => setValue(newValue)}

                    // affichage de l'option dans l'input
                    getOptionLabel={(option) =>
                        `${option.prenom} ${option.nom}`
                    }

                    // vérification de l'égalité entre une option et la valeur sélectionnée (pour éviter les problèmes d'affichage dans l'input)
                    isOptionEqualToValue={(option, value) =>
                        option.numeroEtudiant === value.numeroEtudiant
                    }

                    // Style de rendu pour chaque option du menu déroulant
                    renderOption={(props, option) => {
                        const { key, ...optionProps } = props;

                        return (
                            <Box component="li" key={key} {...optionProps} sx={{ p: 0 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        px: 1.5,
                                        py: 1,
                                        mx: 1,
                                        my: 0.5,
                                        borderRadius: 1,
                                    }}
                                >

                                    <Typography fontWeight={500}>
                                        {option.prenom} {option.nom}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    }}

                    renderInput={(params) => (
                        <TextField {...params} label="Rechercher un étudiant" />
                    )}
                />

                {/* Troisème partie de la carte d'anonymat (bouton de vérification) */}
                <Button variant="contained" color="success">
                    Vérifier
                </Button>
            </Stack>
        </>
    );
}