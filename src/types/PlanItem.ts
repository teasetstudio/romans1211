import { TMaterialType, TMaterial } from "./Materials"

export interface IPreparation {
  id: string
  title: string
  order: number
  isCompleted: boolean
  completedAt: Date | null
  completedBy: string | null
  eventPlanItemId: string
  createdAt: Date
  updatedAt: Date
}

export interface IPlanItem {
  id: string
  title: string
  type: TMaterialType | "CUSTOM"
  materialId: string | null
  material?: TMaterial
  description?: string | null
  isReserve?: boolean
  preparations?: IPreparation[]
}
