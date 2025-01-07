import { ICard } from "@/components/CardGrid/Card";
import { materialPlaceholderImg } from "@/res/values";
import { TMaterialWithIncluded, TMaterialType } from "@/types/Materials";
import { getDashboardMaterialUrl, getMaterialUrl } from "./urls";
import { Lang } from "@/types/Lang";

export function _transformMaterialToCard(material: TMaterialWithIncluded, type: TMaterialType, isDashboard = false): ICard {
  const link = isDashboard ? getDashboardMaterialUrl({ type, id: material.id }) : getMaterialUrl({ type, id: material.id })
  return {
    id: material.id,
    title: material.title,
    content: material.content,
    imageUrl: materialPlaceholderImg[type],
    link,
    language: material.language as Lang,
    organizationName: material.organization.name,
    createdAt: material.createdAt,
    type,
    tags: material.tags
  };
}
