import { Stack } from "@mui/material";
import IncidentListe from "./IncidentListe";
import IncidentDetail from "./IncidentDetail";
import { useState } from "react";

import type { APIIncident } from '../../../../../contracts/incidents';
import { getIncidents } from "../../../../../contracts/incidents";
import { useEffect } from "react";


interface IncidentsCompletsProps {
    idSession: number;
    epreuveCode: string;
    onIncidentCreated?: () => void;
    onIncidentResolved?: () => void;
}

export function IncidentsComplets({ idSession, epreuveCode, onIncidentCreated, onIncidentResolved }: IncidentsCompletsProps) {

    const [allIncidents, setAllIncidents] = useState<APIIncident[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<APIIncident | null>(null);
    const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);

    const [, setOuvertSucces] = useState(false);
    const [, setOuvertEchec] = useState(false);
    const [, setMessageSnackbar] = useState("");

    useEffect(() => {
        const getAllIncidents = async () => {
            try {
                const response = await getIncidents(idSession, epreuveCode);
                console.log("Incidents récupérés :", response);
                if (response.data?.incidents) {
                    setAllIncidents(response.data.incidents);
                    console.log("Incidents enregistrés dans le state :", response.data.incidents.length);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des incidents :", error);
            }
        };

        getAllIncidents();
    }, [idSession, epreuveCode]);

    const handleClickIncident = (incident: APIIncident) => {
        setSelectedIncident(incident);
        setSelectedIncidentId(incident.idIncident);
    }


    const ajouterIncident = (incident: APIIncident) => {
        setAllIncidents((prev) => {
            if (prev.some((item) => item.idIncident === incident.idIncident)) {
                return prev;
            }

            onIncidentCreated?.();
            return [...prev, incident];
        });
    }

    const retirerIncident = (idIncident: number) => {
        setAllIncidents((prev) => {
            const next = prev.filter(incident => incident.idIncident !== idIncident);
            if (next.length < prev.length) {
                onIncidentResolved?.();
            }
            return next;
        });
    }


    return (
        <Stack direction="row" spacing={2} height="100%" justifyContent={"center"}>

            <Stack sx={{
                width: selectedIncident ? "40%" : "50%",
                transition: 'width 0.3s ease-in-out, padding 0.3s ease-in-out',

            }}

            >
                <IncidentListe liste={allIncidents} onClick={handleClickIncident} selectedIncidentId={selectedIncidentId} />
            </Stack>

            <Stack
                sx={{
                    width: selectedIncident ? "60%" : "0%",
                    transition: 'width 0.3s ease-in-out',
                }}

            >
                {selectedIncident &&
                    <IncidentDetail
                        incident={selectedIncident}
                        onClose={() => setSelectedIncident(null)}
                        onClick={() => setSelectedIncident(null)}
                        ajouterIncident={ajouterIncident}
                        retirerIncident={retirerIncident}
                        setOuvertSucces={setOuvertSucces}
                        setOuvertEchec={setOuvertEchec}
                        setMessageSnackbar={setMessageSnackbar}
                    />
                }
            </Stack>

        </Stack>
    )
}