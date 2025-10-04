import { TMaterialType, TMaterial } from "./Materials"

export interface IPlanItem {
  id: string
  title: string
  type: TMaterialType | "CUSTOM"
  materialId: string | null
  material?: TMaterial
  description?: string | null
  isReserve?: boolean
}
