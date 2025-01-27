// import { useEffect, useState } from 'react';
// import { Validator, ValidationResult } from '../../core/Validator.js';

// export function useValidator<T>(schema: any, initialData: T) {
//   const [errors, setErrors] = useState<Record<string, string[]>>({});
//   const validator = new Validator<T>(schema);

//   const validate = async (data: T) => {
//     const result = await validator.validateAsync(data);
//     setErrors(result.errors);
//     return result.isValid;
//   };

//   return { validate, errors };
// }