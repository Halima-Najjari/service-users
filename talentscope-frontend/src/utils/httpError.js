export function getHttpErrorMessage(error) {
  if (!error) return "Une erreur inattendue est survenue.";

  if (error.code === "ERR_NETWORK") {
    return "Impossible de joindre le serveur. Vérifiez que le backend est démarré.";
  }

  if (error.response) {
    const status = error.response.status;
    if (status === 400) return "Les informations envoyées sont invalides.";
    if (status === 401) return "Email ou mot de passe incorrect.";
    if (status === 403)
      return "Vous n’avez pas les droits nécessaires pour cette action.";
    if (status === 404) return "La ressource demandée est introuvable.";
    if (status >= 500)
      return "Le serveur rencontre une erreur. Veuillez réessayer.";
  }

  return "Une erreur est survenue. Veuillez réessayer.";
}
