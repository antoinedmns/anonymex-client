import { SessionModalBouton, SessionChampDate, SessionChampTexte } from "../composantsFormulaireSession";
import React from "react";
import { ArrowForwardIosOutlined } from "@mui/icons-material";
import { Stack } from "@mui/material";

type Props = {
    nomSession: string;
    date: string;
    setNomSession: (v: string) => void;
    setDate: (v: string) => void;
    onNext: () => void;
};

export default function SessionEtapeTexte({ nomSession, date, setNomSession, setDate, onNext }: Props) {

    const [errors, setErrors] = React.useState({
        nom: null as string | null,
        date: null as string | null
    });

    const [loading, setLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = { nom: null as string | null, date: null as string | null };

        if (nomSession.length < 1) {
            newErrors.nom = "Le nom de la session doit contenir au moins 1 caractère.";
        }

        if (date < new Date().getFullYear().toString()) {
            newErrors.date = `L'année doit être supérieure à ${new Date().getFullYear() - 1}.`;
        }

        setErrors(newErrors);

        if (newErrors.nom || newErrors.date) return;

        setLoading(true);
        onNext();
        setLoading(false);
    };

    return (
        <Stack component="form" onSubmit={handleSubmit} justifyContent={'space-between'} flexDirection={'column'} gap={2} margin={4}>

            <SessionChampTexte label="Nom de la session" name="nom" onChange={setNomSession} error={errors.nom} value={nomSession} />
            <SessionChampDate label="Année" onChange={setDate} error={errors.date} value={date} name={"annee"} />
            <SessionModalBouton label="Étape suivante" loading={loading} endIcon={<ArrowForwardIosOutlined />} disabled={nomSession.length < 1 || date.length < 1} />

        </Stack>
    );
}
