import { LanguagePack } from '../../types/messages.js';

const esMessages: LanguagePack = {
  required: 'El campo {field} es obligatorio',
  nullable: 'El campo {field} puede ser nulo',
  optional: 'El campo {field} es opcional',

  string: 'El campo {field} debe ser una cadena de texto',
  number: 'El campo {field} debe ser un número',
  boolean: 'El campo {field} debe ser un booleano',
  array: 'El campo {field} debe ser un arreglo',
  object: 'El campo {field} debe ser un objeto',
  date: 'El campo {field} debe ser una fecha válida',

  'string.min': 'El campo {field} debe tener al menos {min} caracteres',
  'string.max': 'El campo {field} no debe exceder de {max} caracteres',
  'string.length':
    'El campo {field} debe tener exactamente {length} caracteres',
  'string.email': 'El campo {field} debe ser un correo electrónico válido',
  'string.url': 'El campo {field} debe ser una URL válida',
  'string.regex': 'El formato del campo {field} no es válido',
  'string.alpha': 'El campo {field} solo debe contener letras',
  'string.alpha_num': 'El campo {field} solo debe contener letras y números',
  'string.alpha_num_dash':
    'El campo {field} solo debe contener letras, números, guiones y guiones bajos',
  'string.uuid': 'El campo {field} debe ser un UUID válido',
  'string.json': 'El campo {field} debe ser un JSON válido',
  'string.starts_with': 'El campo {field} debe comenzar con {prefix}',
  'string.ends_with': 'El campo {field} debe terminar con {suffix}',
  'string.contains': 'El campo {field} debe contener {substring}',
  'string.in': 'El campo {field} debe ser uno de: {options}',
  'string.not_in': 'El campo {field} no debe ser uno de: {options}',
  'string.hex': 'El campo {field} debe ser un color hexadecimal válido',
  'string.credit_card':
    'El campo {field} debe ser un número de tarjeta de crédito válido',
  'string.alpha_space': 'El campo {field} solo debe contener letras y espacios',

  'number.min': 'El campo {field} debe ser al menos {min}',
  'number.size': 'El campo {field} debe ser igual a {0}',
  'number.max': 'El campo {field} no debe exceder de {max}',
  'number.numeric': 'El campo {field} debe ser numérico',
  'number.between': 'El campo {field} debe estar entre {min} y {max}',
  'number.positive': 'El campo {field} debe ser positivo',
  'number.negative': 'El campo {field} debe ser negativo',
  'number.integer': 'El campo {field} debe ser un número entero',
  'number.decimal':
    'El campo {field} debe tener como máximo {places} decimales',
  'number.multiple_of': 'El campo {field} debe ser múltiplo de {divisor}',
  'number.in': 'El campo {field} debe ser uno de: {options}',
  'number.not_in': 'El campo {field} no debe ser uno de: {options}',

  'boolean.true': 'El campo {field} debe ser verdadero',
  'boolean.accepted': 'El campo {field} debe ser aceptado',
  'boolean.false': 'El campo {field} debe ser falso',

  'date.after': 'El campo {field} debe ser posterior a {date}',
  'date.before': 'El campo {field} debe ser anterior a {date}',
  'date.after_or_equal': 'El campo {field} debe ser posterior o igual a {date}',
  'date.before_or_equal': 'El campo {field} debe ser anterior o igual a {date}',
  'date.format': 'El campo {field} debe coincidir con el formato {format}',
  'date.timezone': 'El campo {field} debe estar en la zona horaria {timezone}',
  'date.weekday': 'El campo {field} debe ser un día laborable',
  'date.weekend': 'El campo {field} debe ser un fin de semana',
  'date.iso': 'El campo {field} debe ser una fecha ISO válida',

  'array.min': 'El campo {field} debe contener al menos {min} elementos',
  'array.max': 'El campo {field} no debe contener más de {max} elementos',
  'array.length':
    'El campo {field} debe contener exactamente {length} elementos',
  'array.unique': 'El campo {field} debe contener elementos únicos',
  'array.contains': 'El campo {field} debe contener {value}',

  'object.shape': 'El campo {field} tiene una estructura inválida',
  'object.strict': 'El campo {field} contiene propiedades no válidas',
  'object.keys': 'El campo {field} contiene claves inválidas',

  'file.max': 'El campo {field} no debe exceder de {max}KB',
  'file.min': 'El campo {field} debe tener al menos {min}KB',
  'file.width': 'El campo {field} debe tener {width} píxeles de ancho',
  'file.height': 'El campo {field} debe tener {height} píxeles de alto',
  'file.minWidth':
    'El campo {field} debe tener al menos {minWidth} píxeles de ancho',
  'file.minHeight':
    'El campo {field} debe tener al menos {minHeight} píxeles de alto',
  'file.maxWidth':
    'El campo {field} no debe exceder de {maxWidth} píxeles de ancho',
  'file.maxHeight':
    'El campo {field} no debe exceder de {maxHeight} píxeles de alto',
  'file.extensions': 'El campo {field} debe tener la extensión: {extensions}',
  'file.image': 'El campo {field} debe ser una imagen',
  'file.dimensions': 'Las dimensiones del campo {field} son inválidas',
  'file.between': 'El campo {field} debe estar entre {min}KB y {max}KB',
  'file.size': 'El campo {field} debe tener exactamente {size}KB',

  required_if: 'El campo {field} es obligatorio cuando {field} es {value}',
  required_with:
    'El campo {field} es obligatorio cuando {fields} está presente',
  required_with_all:
    'El campo {field} es obligatorio cuando todos los campos {fields} están presentes',
  required_without:
    'El campo {field} es obligatorio cuando {fields} no está presente',
  required_without_all:
    'El campo {field} es obligatorio cuando ninguno de los campos {fields} está presente',
  required_unless:
    'El campo {field} es obligatorio a menos que {field} sea {value}',

  union:
    'El campo {field} debe coincidir con uno de los siguientes formatos: {formats}',
  'union.failed':
    'El campo {field} debe coincidir con al menos uno de los formatos especificados',
  'union.detailed':
    'El campo {field} debe coincidir con uno de los siguientes formatos: {formats}',

  invalid: 'El campo {field} no es válido',
  type_error: 'El campo {field} debe ser del tipo {type}',
  custom_rule: 'El campo {field} no pasó la validación personalizada',
};

export default esMessages;
