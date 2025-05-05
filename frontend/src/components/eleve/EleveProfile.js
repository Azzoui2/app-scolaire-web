import React from 'react';

const EleveProfile = ({ eleve }) => {
  if (!eleve) {
    return <div>Chargement du profil...</div>;
  }

  return (
    <div className="p-4 rounded-xl shadow-lg bg-white max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">Profil de l'élève</h2>
      <div className="mb-2">
        <strong>Nom :</strong> {eleve.nom}
      </div>
      <div className="mb-2">
        <strong>Prénom :</strong> {eleve.prenom}
      </div>
      <div className="mb-2">
        <strong>Classe :</strong> {eleve.classe}
      </div>
      <div className="mb-2">
        <strong>Email :</strong> {eleve.email}
      </div>
      <div className="mb-2">
        <strong>Date de naissance :</strong> {eleve.dateNaissance}
      </div>
    </div>
  );
};

export default EleveProfile;
