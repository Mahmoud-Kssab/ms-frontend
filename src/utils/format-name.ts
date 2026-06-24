export function formatName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(' ');
}
