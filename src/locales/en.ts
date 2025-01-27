export default {
  required: "The :attribute field is required",
  string: "The :attribute must be a string",
  number: "The :attribute must be a number",
  date: "The :attribute must be a valid date",
  boolean: "The :attribute must be a boolean value",
  min: {
    string: "The :attribute must be at least :min characters",
    numeric: "The :attribute must be at least :min",
  },
  max: {
    string: "The :attribute may not be greater than :max characters",
    numeric: "The :attribute may not be greater than :max",
  },
  email: "The :attribute must be a valid email address",
  accepted: "The :attribute must be accepted",
  required_if: "The :attribute field is required when :other is :value",
};
