import { ICard } from "@/components/CardGrid/Card";
import { materialPlaceholderImg } from "@/res/values";
import { TMaterialWithIncluded, TMaterialType } from "@/types/Materials";
import { getMaterialUrl } from "./urls";
import { Lang } from "@/types/Lang";

export function _transformMaterialToCard(material: TMaterialWithIncluded, type: TMaterialType): ICard {
  return {
    id: material.id,
    title: material.title,
    content: material.content,
    imageUrl: materialPlaceholderImg[type],
    link: getMaterialUrl({type, id: material.id}),
    language: material.language as Lang,
    organizationName: material.organization.name,
    createdAt: material.createdAt,
    type,
    tags: material.tags
  };
}
