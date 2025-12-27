type ClassValue = string | undefined | null | false | Record<string, boolean>;

/**
 * Merges class names, filtering out falsy values.
 * Supports strings and objects with boolean values.
 * @example cn("base", { "active": isActive, "disabled": isDisabled })
 */
export function cn(...classes: ClassValue[]): string {
  return classes
    .flatMap((c) => {
      if (!c) return [];
      if (typeof c === "string") return c;
      return Object.entries(c)
        .filter(([, v]) => v)
        .map(([k]) => k);
    })
    .join(" ");
}
