/**
 * Takes in the case string and returns an HTML compatible string
 */
export default function convertInputTypeToHTML(inputType) {
  switch (inputType) {
    case 'TEXT':
      return 'text';
    case 'NUMBER':
      return 'number';
    case 'BOOLEAN':
      return 'checkbox';
    case 'DATE_DMY':
      return 'date';
    case 'PREDEFINED_CHOICE':
      return 'text';
    default:
      return 'text';
  }
}