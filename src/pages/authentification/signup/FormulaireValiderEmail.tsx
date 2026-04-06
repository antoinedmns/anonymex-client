import { Alert, Stack } from "@mui/material";
import { useState } from "react";
import { AuthBoutonValidation, AuthChampEmail, AuthFormCorps, AuthFormulaire } from "../composantsFormulaireAuth";
import { getInvitationInfo } from "../../../contracts/utilisateurs";

export default function InscriptionValiderEmail({ jeton, onValidate }: { jeton: string; onValidate: (email: string) => void }) {
    const [email, setEmail] = useState<string>('');
    const [emailValide, setEmailValide] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Envoi du formulaire
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        
        // Email invalide?
        if (!(/^\S+@\S+\.\S+$/).test(email)) {
            setEmailValide(false);
            return;
        }

        const response = await getInvitationInfo(jeton, email);
        if (!response.data || response.status !== 200) return setError(response.error || 'Erreur inconnue');
        
        // Email correct?
        if (response.data.success) onValidate(email);
        else setEmailValide(false);

    };

    const handleSetEmail = (v: string) => {
        setEmail(v);
        setEmailValide(true);
    };

    return (
        <AuthFormulaire onSubmit={handleSubmit}>
            <AuthFormCorps
                title={jeton === "setup" ? "Bienvenue" : "Inscription"}
                description={jeton === "setup" ? "Saisissez l'adresse e-mail du compte administrateur que vous souhaitez créer."
                    : "Saisissez l'adresse e-mail indiquée par l'administrateur lors de la création de votre lien d'invitation. Elle doit correspondre exactement."}
            >
                <Stack spacing={2} direction={"row"}>
                    <AuthChampEmail value={email} onChange={handleSetEmail} error={!emailValide ? "Adresse e-mail invalide." : null} />
                    <AuthBoutonValidation label="Valider" loading={false} padding="0.9rem 1.5rem"/>
                </Stack>

                {error && <Alert severity="error">{error}</Alert>}
            </AuthFormCorps>
        </AuthFormulaire>
    );
}