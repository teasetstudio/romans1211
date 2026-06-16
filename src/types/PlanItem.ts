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
  // Scheduling (SCHEDULE events): day offset from event start + time of day
  dayIndex?: number
  startHour?: number | null
  startMinute?: number | null
  duration?: number | null
}

export interface IDefaultPreparation {
  id: string
  title: string
  order: number
  eventPlanItemId?: string
}

export interface IDefaultPlanItem {
  id: string
  title: string

  description?: string | null
  preparations?: IDefaultPreparation[]
}
