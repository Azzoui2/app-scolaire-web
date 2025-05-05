const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const csvParser = require("csv-parser");
const moment = require("moment");
const Eleve = require("../models/Eleve");
const Classe = require("../models/Class");
const authMiddleware = require("./auth_midd_prof"); // Middleware d'authentification


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 🟢 Ajouter un élève manuellement
router.post("/", async (req, res) => {
    try {
        const { nom, prenom, dateNaissance, classe } = req.body;
        console.log("📥 Nouvelle requête d'ajout d'élève :", { nom, prenom, dateNaissance, classe });

        const newEleve = new Eleve({ nom, prenom, dateNaissance, classe });
        await newEleve.save();

        console.log("✅ Élève ajouté avec succès !");
        res.status(201).json({ message: "Élève ajouté avec succès" });
    } catch (error) {
        console.error("❌ Erreur lors de l'ajout d'un élève :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'élève" });
    }
});

// 🟢 Importer des élèves depuis un fichier Excel
router.post("/import", upload.single("file"), async (req, res) => {
    try {
        console.log("🟢 Fichier reçu :", req.file ? req.file.originalname : "Aucun fichier");

        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier fourni" });
        }

        const fileName = req.file.originalname.toLowerCase();
        let rows = [];

        if (fileName.endsWith(".csv")) {
            rows = await new Promise((resolve, reject) => {
                const results = [];
                const bufferStream = require("stream").Readable.from(req.file.buffer.toString("utf8"));

                bufferStream
                    .pipe(csvParser({ separator: ";" }))
                    .on("data", (data) => results.push(data))
                    .on("end", () => resolve(results))
                    .on("error", (err) => reject(err));
            });

        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        } else {
            return res.status(400).json({ error: "Format de fichier non supporté" });
        }

        if (rows.length === 0) {
            return res.status(400).json({ error: "Le fichier est vide ou mal formaté" });
        }

        console.log("🔹 Données extraites du fichier :", rows);

        // 📌 Normalisation des clés (suppression des espaces, harmonisation des majuscules/minuscules)
        const normalizeKey = (key) => key.toLowerCase().trim().replace(/\s+/g, "_");

        const formattedRows = rows.map(row => {
            let formattedRow = {};
            Object.keys(row).forEach(key => {
                formattedRow[normalizeKey(key)] = row[key];
            });

            // 📌 Conversion des dates (Excel et formats texte)
            let dateNaissance = null;
            if (formattedRow.date_de_naissance) {
                if (!isNaN(formattedRow.date_de_naissance)) {
                    // Format Excel (ex: 36558 → YYYY-MM-DD)
                    dateNaissance = moment("1900-01-01").add(formattedRow.date_de_naissance - 2, "days").format("YYYY-MM-DD");
                } else {
                    // Format texte (ex: "02/02/2000")
                    dateNaissance = moment(formattedRow.date_de_naissance, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD");
                }
            }

            return {
                nom: formattedRow.nom || null,
                prenom: formattedRow.prenom || formattedRow.prenom_ || null, // Gestion des erreurs d'espace
                dateNaissance: dateNaissance,
                classe: formattedRow.classe || null
            };
        });

        console.log("📤 Données préparées pour MongoDB :", formattedRows);

        // 📌 Filtrer les données invalides avant insertion
        const validEleves = formattedRows.filter(eleve => eleve.nom && eleve.prenom && eleve.classe);

        if (validEleves.length === 0) {
            return res.status(400).json({ error: "Aucune donnée valide trouvée. Vérifiez votre fichier." });
        }

        await Eleve.insertMany(validEleves);

        res.json({ message: "Importation réussie", data: validEleves });

    } catch (error) {
        console.error("❌ Erreur d'importation :", error);
        res.status(500).json({ error: error.message || "Erreur lors de l'importation des élèves" });
    }
});

// 🟢 Route pour récupérer tous les élèves avec les noms des classes
router.get("/", async (req, res) => {  
    try {
        // Utilisation de .populate() pour récupérer le nom de la classe associée à chaque élève
        const eleves = await Eleve.find()
            .populate("classe", "nom")  // Peupler le champ 'classe' avec le nom de la classe
            .exec();  // Assurer l'exécution de la promesse
        res.json(eleves);  // Retourne la liste des élèves avec le nom de la classe
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des élèves :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des élèves" });
    }
});

// router.get("/:classeId", authMiddleware, async (req, res) => {
//     try {
//         const { classeId } = req.params;

//         const classe = await Classe.findById(classeId);
//         if (!classe) {
//             return res.status(404).json({ message: "Classe non trouvée." });
//         }

//         const eleves = await Eleve.find({ classe: classeId });

//         res.json({ classe, eleves });
//     } catch (error) {
//         console.error("Erreur lors de la récupération des élèves :", error);
//         res.status(500).json({ message: "Erreur interne du serveur." });
//     }
// });
// router.get("/api/eleves/classe/:nomClasse", async (req, res) => {
//     try {
//       const { nomClasse } = req.params;
//       const eleves = await Eleve.find({ classe: nomClasse }); // Rechercher par nom de classe
//       res.json({ eleves });
//     } catch (error) {
//       console.error("Erreur lors de la récupération des élèves :", error);
//       res.status(500).json({ message: "Erreur serveur." });
//     }
//   });
// router.get("/:classeId", async (req, res) => {
//     try {
//       const classeId = req.params.classeId;
//       console.log("Requête reçue pour la classe ID:", classeId);
  
//       // Vérifier si la classe existe
//       const classe = await Classe.findById(classeId);
//       if (!classe) {
//         console.log("Classe non trouvée pour l'ID :", classeId);
//         return res.status(404).json({ message: "Classe non trouvée." });
//       }
  
//       // 🔍 Vérifier les élèves
//       const eleves = await Eleve.find({ classe: classeId });
//       console.log("Élèves trouvés :", eleves);
  
//       res.status(200).json({ classe, eleves });
//     } catch (error) {
//       console.error("Erreur lors de la récupération des élèves :", error);
//       res.status(500).json({ message: "Erreur serveur lors de la récupération des élèves." });
//     }
//   });

// router.get("/:classeNom", async (req, res) => {
//     try {
//         const classeNom = req.params.classeNom;

//         console.log(`🔎 Recherche des élèves pour la classe : "${classeNom}"`);

//         if (!classeNom) {
//             return res.status(400).json({ message: "Nom de classe requis." });
//         }

//         // Recherche stricte de la classe
//         const eleves = await Eleve.find({ classe: classeNom });

//         console.log(`📌 Élèves trouvés pour "${classeNom}" :`, eleves);

//         if (eleves.length === 0) {
//             return res.status(404).json({ message: "Aucun élève trouvé pour cette classe." });
//         }

//         res.json({ eleves });

//     } catch (error) {
//         console.error("🚨 Erreur serveur :", error);
//         res.status(500).json({ message: "Erreur serveur." });
//     }
// });


router.get("/:classeNom", async (req, res) => {
    try {
        const classeNom = req.params.classeNom;

        console.log(`🔎 Recherche des élèves pour la classe : "${classeNom}"`);

        if (!classeNom) {
            return res.status(400).json({ message: "Nom de classe requis." });
        }

        // Recherche en utilisant une expression régulière pour inclure toutes les variantes du nom de classe
        const eleves = await Eleve.find({ classe:classeNom });
        

        console.log(`📌 Élèves trouvés pour "${classeNom}" :`, eleves);

        if (eleves.length === 0) {
            return res.status(404).json({ message: "Aucun élève trouvé pour cette classe." });
        }

        res.json({ eleves });

    } catch (error) {
        console.error("🚨 Erreur serveur :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

module.exports = router;
