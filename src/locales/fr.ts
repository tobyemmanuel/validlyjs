export default {
  required: "Le champ :attribute est obligatoire",
  string: "Le champ :attribute doit être une chaîne de caractères",
  number: "Le champ :attribute doit être un nombre",
  date: "Le champ :attribute doit être une date valide",
  boolean: "Le champ :attribute doit être une valeur booléenne",
  min: {
    string: "Le champ :attribute doit contenir au moins :min caractères",
    numeric: "La valeur de :attribute doit être supérieure ou égale à :min",
  },
  max: {
    string: "Le champ :attribute ne doit pas dépasser :max caractères",
    numeric: "La valeur de :attribute doit être inférieure ou égale à :max",
  },
  email: "Le champ :attribute doit être une adresse email valide",
  accepted: "Le champ :attribute doit être accepté",
  required_if: "Le champ :attribute est obligatoire lorsque :other est :value",
};
