import { Add } from "@mui/icons-material";
import { Button, Card, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { ModalCreationEtudiant } from "./ModalCreationEtudiant";

type CodeSupplementaireCarteProps = {
    codeAnonymat: string;
    numeroEtudiant?: number;
    onAssociate: (numeroEtudiant: number) => Promise<void>;
}

export default function CodeSupplementaireCarte({ codeAnonymat, numeroEtudiant, onAssociate }: CodeSupplementaireCarteProps) {

    const [inputValue, setInputValue] = useState("");
    const [fieldError, setFieldError] = useState<boolean>(false);
    const [isAssociating, setIsAssociating] = useState(false);
    const [isAssociated, setIsAssociated] = useState(false);

    const [modalCreation, setModalCreation] = useState(false);

    useEffect(() => {
        if (numeroEtudiant && Number.isInteger(numeroEtudiant) && numeroEtudiant > 0) {
            setInputValue(String(numeroEtudiant));
            setIsAssociated(true);
            setFieldError(false);
            return;
        }

        setInputValue("");
        setIsAssociated(false);
        setFieldError(false);
    }, [numeroEtudiant]);

    function OuvertureModal() {
        setFieldError(false);
        setModalCreation(true);
    }

    const handleNouveauEtudiantCree = async (numeroEtudiant: number) => {
        setInputValue(String(numeroEtudiant));
        setFieldError(false);
        setIsAssociated(false);
        setModalCreation(false);
    }

    async function handleClickAssocier() {
        const value = inputValue.trim();
        const numeroEtudiant = Number(value);

        if (!value || !Number.isInteger(numeroEtudiant) || numeroEtudiant <= 0) {
            setFieldError(true);
            return;
        }

        setIsAssociating(true);
        setFieldError(false);

        try {
            await onAssociate(numeroEtudiant);
            setIsAssociated(true);
        } catch {
            setFieldError(true);
        } finally {
            setIsAssociating(false);
        }
    }

    return (
        <>
            <Card
                variant="outlined"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: grey[50],
                    width: "100%",
                    flexShrink: 0,
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flex={1} minWidth={0}>
                    <Typography variant="h6" fontWeight="bold" lineHeight={1.1} noWrap>
                        {codeAnonymat}
                    </Typography>

                    <TextField
                        label="Numéro étudiant"
                        type="text"
                        size="small"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setFieldError(false);
                            setIsAssociated(false);
                        }}
                        inputProps={{ inputMode: "numeric" }}
                        helperText={fieldError ?? ""}
                        error={Boolean(fieldError)}
                        disabled={isAssociated || isAssociating}
                        sx={{ flex: '0 0 320px', width: 320, minWidth: 320 }}
                        slotProps={isAssociated ? undefined : {
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Créer un étudiant" arrow>
                                            <span>
                                                <IconButton onClick={OuvertureModal} edge="end" disabled={isAssociating}>
                                                    <Add />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Stack>

                <Button
                    variant="contained"
                    color="success"
                    disabled={isAssociated || isAssociating}
                    onClick={handleClickAssocier}
                >
                    Associer
                </Button>
            </Card>

            {modalCreation && (
                <ModalCreationEtudiant
                    onClose={() => setModalCreation(false)}
                    onEtudiantCree={handleNouveauEtudiantCree}
                    initialNumeroEtudiant={inputValue}
                />
            )}
        </>
    );
}