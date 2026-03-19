import IncidentCard from './IncidentCard';
import { Stack, Typography } from '@mui/material';
import type { APIIncident } from '../../../../../contracts/incidents';


interface IncidentListeProps {
    liste: APIIncident[];
    onClick: (incident: APIIncident) => void;
}

export default function IncidentListe({ liste, onClick }: IncidentListeProps) {
    return (
        <Stack gap={2} >
             <Typography variant='h6'>
                Liste incidents
            </Typography>
            {liste.map((incident) => (
                <IncidentCard 
                    key={incident.idIncident}
                    incident = {incident}
                    onClick={onClick}
                />
            ))}
        </Stack>
    );
}