import { LanguagePack } from '../../types/messages.js';

const frMessages: LanguagePack = {
  required: 'Le champ {field} est requis',
  nullable: 'Le champ {field} peut être nul',
  optional: 'Le champ {field} est facultatif',

  string: 'Le champ {field} doit être une chaîne de caractères',
  number: 'Le champ {field} doit être un nombre',
  boolean: 'Le champ {field} doit être un booléen',
  array: 'Le champ {field} doit être un tableau',
  object: 'Le champ {field} doit être un objet',
  date: 'Le champ {field} doit être une date valide',

  'string.min': 'Le champ {field} doit comporter au moins {min} caractères',
  'string.max': 'Le champ {field} ne doit pas dépasser {max} caractères',
  'string.length':
    'Le champ {field} doit comporter exactement {length} caractères',
  'string.email': 'Le champ {field} doit être une adresse e-mail valide',
  'string.url': 'Le champ {field} doit être une URL valide',
  'string.regex': 'Le format du champ {field} est invalide',
  'string.alpha': 'Le champ {field} ne doit contenir que des lettres',
  'string.alpha_num':
    'Le champ {field} ne doit contenir que des lettres et des chiffres',
  'string.alpha_num_dash':
    'Le champ {field} ne doit contenir que des lettres, des chiffres, des tirets et des underscores',
  'string.uuid': 'Le champ {field} doit être un UUID valide',
  'string.json': 'Le champ {field} doit être un JSON valide',
  'string.starts_with': 'Le champ {field} doit commencer par {prefix}',
  'string.ends_with': 'Le champ {field} doit se terminer par {suffix}',
  'string.contains': 'Le champ {field} doit contenir {substring}',
  'string.in': 'Le champ {field} doit être l’un des suivants : {options}',
  'string.not_in':
    'Le champ {field} ne doit pas être l’un des suivants : {options}',
  'string.hex': 'Le champ {field} doit être une couleur hexadécimale valide',
  'string.credit_card':
    'Le champ {field} doit être un numéro de carte bancaire valide',
  'string.alpha_space':
    'Le champ {field} ne doit contenir que des lettres et des espaces',

  'number.min': 'Le champ {field} doit être au moins {min}',
  'number.size': 'Le champ {field} doit être égal à {0}',
  'number.max': 'Le champ {field} ne doit pas dépasser {max}',
  'number.numeric': 'Le champ {field} doit être numérique',
  'number.between': 'Le champ {field} doit être entre {min} et {max}',
  'number.positive': 'Le champ {field} doit être positif',
  'number.negative': 'Le champ {field} doit être négatif',
  'number.integer': 'Le champ {field} doit être un entier',
  'number.decimal': 'Le champ {field} doit avoir au plus {places} décimales',
  'number.multiple_of': 'Le champ {field} doit être un multiple de {divisor}',
  'number.in': 'Le champ {field} doit être l’un des suivants : {options}',
  'number.not_in':
    'Le champ {field} ne doit pas être l’un des suivants : {options}',

  'boolean.true': 'Le champ {field} doit être vrai',
  'boolean.accepted': 'Le champ {field} doit être accepté',
  'boolean.false': 'Le champ {field} doit être faux',

  'date.after': 'Le champ {field} doit être postérieur à {date}',
  'date.before': 'Le champ {field} doit être antérieur à {date}',
  'date.after_or_equal':
    'Le champ {field} doit être postérieur ou égal à {date}',
  'date.before_or_equal':
    'Le champ {field} doit être antérieur ou égal à {date}',
  'date.format': 'Le champ {field} doit correspondre au format {format}',
  'date.timezone':
    'Le champ {field} doit être dans le fuseau horaire {timezone}',
  'date.weekday': 'Le champ {field} doit être un jour ouvrable',
  'date.weekend': 'Le champ {field} doit être un jour de week-end',
  'date.iso': 'Le champ {field} doit être une date ISO valide',

  'array.min': 'Le champ {field} doit contenir au moins {min} éléments',
  'array.max': 'Le champ {field} ne doit pas contenir plus de {max} éléments',
  'array.length': 'Le champ {field} doit contenir exactement {length} éléments',
  'array.unique': 'Le champ {field} doit contenir des éléments uniques',
  'array.contains': 'Le champ {field} doit contenir {value}',

  'object.shape': 'Le champ {field} a une structure invalide',
  'object.strict': 'Le champ {field} contient des propriétés non valides',
  'object.keys': 'Le champ {field} contient des clés non valides',

  'file.max': 'Le champ {field} ne doit pas dépasser {max}KB',
  'file.min': 'Le champ {field} doit être d’au moins {min}KB',
  'file.width': 'Le champ {field} doit avoir une largeur de {width} pixels',
  'file.height': 'Le champ {field} doit avoir une hauteur de {height} pixels',
  'file.minWidth':
    'Le champ {field} doit avoir une largeur minimale de {minWidth} pixels',
  'file.minHeight':
    'Le champ {field} doit avoir une hauteur minimale de {minHeight} pixels',
  'file.maxWidth':
    'Le champ {field} ne doit pas dépasser {maxWidth} pixels de large',
  'file.maxHeight':
    'Le champ {field} ne doit pas dépasser {maxHeight} pixels de haut',
  'file.extensions': 'Le champ {field} doit avoir l’extension : {extensions}',
  'file.image': 'Le champ {field} doit être une image',
  'file.dimensions': 'Les dimensions du champ {field} sont invalides',
  'file.between': 'Le champ {field} doit être entre {min}KB et {max}KB',
  'file.size': 'Le champ {field} doit être exactement de {size}KB',

  required_if: 'Le champ {field} est requis lorsque {field} est {value}',
  required_with: 'Le champ {field} est requis lorsque {fields} est présent',
  required_with_all:
    'Le champ {field} est requis lorsque tous les champs {fields} sont présents',
  required_without: 'Le champ {field} est requis lorsque {fields} est absent',
  required_without_all:
    'Le champ {field} est requis lorsque aucun des champs {fields} n’est présent',
  required_unless: 'Le champ {field} est requis sauf si {field} est {value}',

  union:
    'Le champ {field} doit correspondre à l’un des formats suivants : {formats}',
  'union.failed':
    'Le champ {field} doit correspondre à au moins un des formats spécifiés',
  'union.detailed':
    'Le champ {field} doit correspondre à l’un des formats suivants : {formats}',

  invalid: 'Le champ {field} est invalide',
  type_error: 'Le champ {field} doit être de type {type}',
  custom_rule: 'Le champ {field} a échoué à la validation personnalisée',
};

export default frMessages;
