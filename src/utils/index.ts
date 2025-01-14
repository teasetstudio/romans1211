import { TMaterialType } from "@/types/Materials";

export function isValidMaterialType(type: string): type is TMaterialType {
  const validTypes: TMaterialType[] = ['text', 'song', 'game'];

  return validTypes.includes(type as TMaterialType);
}
