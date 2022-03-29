/**
 * Takes in the case string and returns a default value for the case
 */
export default function getDefaultForInputType(inputType) {
  switch (inputType) {
    case 'TEXT':
      return "";
    case 'NUMBER':
      return 0;
    case 'BOOLEAN':
      return false;
    case 'DATE_DMY':
      return "Missing Date";
    case 'PREDEFINED_CHOICE':
      return "Nothing Selected";
    default:
      return "";
  }
}
