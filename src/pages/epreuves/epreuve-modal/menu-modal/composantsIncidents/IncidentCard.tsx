import { Card, CardActionArea, Stack, Typography } from "@mui/material";
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { APIIncident } from '../../../../../contracts/incidents';


type IncidentType = "resolu" | "non resolu";

interface IncidentCardProps {
    incident: APIIncident;
    onClick: (incident: APIIncident) => void;
    type?: IncidentType;
}

function IncidentCard({ incident, onClick, type = "non resolu" }: IncidentCardProps) {
    const isResolved = type === "resolu";

    const colors = {
        bg: isResolved ? '#e0f9dc' : '#F9DEDC',
        text: isResolved ? '#328521' : '#852221',
        border: isResolved ? '#e0f9dc' : '#F9DEDC'
    };

    return (
        <Card
            variant="outlined"
            sx={{
                borderColor: colors.border,
                backgroundColor: '#fdf0ef87',
                borderRadius: '10px',
                
            }}
        >
            <CardActionArea
                onClick={() => onClick(incident)}
                sx={{ display: 'flex', p: 1.5}}
                
                
            >
                <Stack direction="row" spacing={2} width={"100%"} justifyContent={"flex-start"}>
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        width={40}
                        height={40}
                        padding={2}
                        borderRadius="50%"
                        bgcolor={colors.bg}
                        color={colors.text}
                    >
                        {isResolved ? <CheckCircleIcon /> : <ErrorIcon />}
                    </Stack>

                    <Stack >
                        <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color={isResolved ? "#000000d4" : "#852221"}
                        >
                            {incident.titre} 
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {incident.details}
                        </Typography>
                    </Stack>
                </Stack>
            </CardActionArea>
        </Card>
    );
}

export default IncidentCard;