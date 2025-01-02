interface IBasicCard {
  id: string
  as: string
  href: string
  title: string
  tags: string[]
  price?: number
  currency?: string
  imgUrl: string
}

export interface IMediaCard extends IBasicCard {
  details?: never
  publisher: string
}

export interface IProductDetails {
  region: string
  run: string | number
  readers: string | number
}

export interface ITableCard extends IBasicCard {
  details: IProductDetails
  publisher?: never
}

type TCard = IMediaCard | ITableCard

export default TCard

export interface IAdCard {
  id: string
  title: string
  imgUrl: string
}
