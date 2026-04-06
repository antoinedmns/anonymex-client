const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const moisAnnee = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/**
 * Prend un timestamp et renvoit un format lisible (Lundi 12 janvier 2029 09h30)
 * @param timestamp unix timestamp
 * @returns chaîne de caractères formatée
 */
export function formatterDateEntiere(timestamp: number): string {
    const date = new Date(timestamp * 60000);
    const jourSemaine = joursSemaine[date.getDay()];
    const jourMois = date.getDate();
    const mois = moisAnnee[date.getMonth()];
    const heures = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${jourSemaine} ${jourMois} ${mois} ${heures}h${minutes}`;
}

/**
 * Prend un timestamp et renvoit une DATE lisible (Lundi 12 janvier 2029)
 * @param timestamp timestamp en tant de jour (unix timestamp / 86400000)
 * @returns chaîne de caractères formatée
 */
export function formatterDate(timestamp: number): string {
    const date = new Date(timestamp * 86400000);
    const jourSemaine = joursSemaine[date.getDay()];
    const jourMois = date.getDate();
    const mois = moisAnnee[date.getMonth()];
    return `${jourSemaine} ${jourMois} ${mois}`;
}