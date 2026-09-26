export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export function categoryNamesMatch(left: string, right: string): boolean {
  return normalizeCategoryName(left).toLocaleLowerCase() === normalizeCategoryName(right).toLocaleLowerCase()
}
