import { Autocomplete, Box, Button, Card, Stack, TextField, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import React, { useState } from "react";

type AnonymatCardProps = {
    codeAnonymat: string;
}

export default function AnonymatCard({ codeAnonymat }: AnonymatCardProps) {

    const [inputValue, setInputValue] = useState("");

    return (
        <>
            <Card
                variant="outlined"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: grey[50],
                    width: "100%",
                }}
            >
                {/* Partie gauche */}
                <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                    <Typography variant="h6" fontWeight="bold" minWidth={100}>
                        {codeAnonymat}
                    </Typography>

                    <Autocomplete
                        inputValue={inputValue}
                        open={inputValue.length > 7} // n'ouvrir l'autocomplete que si la saisie fait plus de 7 caractères (longueur d'un numéro étudiant)
                        fullWidth
                        disableClearable

                        onInputChange={(_, newInputValue) => {
                            setInputValue(newInputValue);
                        }}


                        options={[]}

                        /* Affichage de noOptionsText uniquement si inputValue est défini et > 8 */
                        noOptionsText={
                            inputValue.length === 7 ? (
                                <Box
                                    onClick={() => {
                                        console.log(`Ajouter l'étudiant ${inputValue}`);
                                    }}
                                    sx={{
                                        cursor: "pointer",
                                        transition: 'all 0.2s ease',

                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.05)',
                                        },
                                        padding: 1,
                                    }}
                                >
                                    Ajouter l'étudiant {inputValue}
                                </Box>
                            ) : null
                        }

                        renderInput={(params) => (
                            <TextField {...params} label="N°étudiant" size="small" />
                        )}
                    />
                </Stack>

                {/* Bouton */}
                <Button
                    variant="contained"
                    color="success"
                    sx={{ flexShrink: 0 }} // empêche le bouton de se compresser
                    onClick={() => {
                        // TODO : handleClickAssocier (verif input non vide,...)
                        console.log(`Associer le code d'anonymat ${codeAnonymat} à l'étudiant ${inputValue}`);
                    }}
                >
                    Associer
                </Button> {/* TODO :Grisé si déjà associé*/}
            </Card>
        </>
    );
}