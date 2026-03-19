import {Divider, Stack, Typography } from '@mui/material';
import React from 'react';
import FichierListe from './composantsIncidents/FichierListe';
import IncidentListe from './composantsIncidents/IncidentListe';
import IncidentDetail from './composantsIncidents/IncidentDetail';
import type { APIEpreuve } from '../../../../contracts/epreuves';


// Les incidents de tests. les données ne sont pas finales.
const ListeIncidents = [
    {
        nomIncident: "Scan illisible",
        descriptionIncident: "Le scan de la copie est illisible, il est impossible de corriger la copie.",
        numeroAnonymat: null,
        note: null,
        id: 1
    },
    {
        nomIncident: "Note erronée",
        descriptionIncident: "La note de la copie a été saisie de manière erronée, elle doit être corrigée.",
        numeroAnonymat: "123456",
        note: "25",
        id: 2
    },
    {
        nomIncident: "Fichier vide",
        descriptionIncident: "Le fichier de la copie est vide, il doit être téléchargé à nouveau.",
        numeroAnonymat: null,
        note: null,
        id: 3
    }
]

interface MenuIncidentsProps {
    epreuve: APIEpreuve;
}


// Note : le menu incidents est pour l'instant un composant de test, il n'est pas encore connecté à une source de données réelle. 
// Il affiche une liste d'incidents fictifs et permet de cliquer sur un incident pour en voir les détails. 
// Il y a encore des erreurs, des améliorations de style à faire et des fonctionnalités a implémenter.
// Il est prévu que les incidents soient liés à des fichiers de copies d'examen, et que la lecture de ces fichiers génère des incidents qui sont ensuite affichés dans ce menu.

export default function MenuIncidents({ epreuve }: MenuIncidentsProps) {

    // Menu incidents recois un ensemble de fichiers à traiter
    // Le scan de ces fichiers donne lieu à des incidents qui sont affichés dans le menu incidents

    const [incidentSelectionne, setIncidentSelectionne] = React.useState<number | null>(null);

    const incident = ListeIncidents.find(i => i.id === incidentSelectionne);

    return (
        <>
            <Stack direction="row" margin={"2em"} divider={<Divider orientation="vertical" flexItem />} gap={6}>
                <Stack gap={2} width={"50%"}>
                    <Typography variant="h5">Incidents à traiter</Typography>
                    {/* 
                    <IncidentListe 
                        liste={ListeIncidents.map(incident => ({
                            nom: incident.nomIncident,
                            description: incident.descriptionIncident,
                            id: incident.id
                        }))}
                        onClick={(id) => setIncidentSelectionne(id!)}
                    />
                    */}
                </Stack>

                {incidentSelectionne !== null && incident && (
                    <Stack gap={2}>
                        
                        <IncidentDetail 
                            numeroAnonymat={incident.numeroAnonymat} 
                            note={incident.note} 
                            idIncident={incident.id} 
                            onClick={() => setIncidentSelectionne(null)} 
                            // TODO : remplacer le console.log par une fonction qui met à jour la liste des incidents (actuellement en dur dans le composant) 
                            onClose={id => {setIncidentSelectionne(null); console.log("Incident fermé :", id); ListeIncidents.splice(ListeIncidents.findIndex(i => i.id === id), 1)}} 
                            fichier={''} 
                        />

                    </Stack>
                )}

                {!incidentSelectionne && (
                    <Stack gap={2}>
                        <Typography variant="h5">Lecture des documents en cours</Typography>

                        <FichierListe liste={[{nom: "Fichier1.pdf"}, {nom: "Fichier2.pdf"}, {nom: "Fichier3.pdf"}]}/>
                    </Stack>
                )}
            </Stack>
        </>
    )
}