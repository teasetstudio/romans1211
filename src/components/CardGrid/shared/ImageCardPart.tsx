import Image from 'next/image';

interface IProps {
  imageUrl: string
  title: string
  organizationName: string
}

const ImageCardPart = ({ imageUrl, title, organizationName }: IProps) => {
  return (
    <div className="relative h-20 flex-shrink-0 bg-gray-50 will-change-transform">
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 585px) 100vw, (max-width: 1075px) 45vw, 22vw"
        className="object-cover object-right w-full h-full opacity-60 grayscale hover:grayscale-0 hover:opacity-70 transition-[opacity,filter] duration-300 ease-in-out transform-gpu"
      />
      {/* Variant 1: from-gray-900/40 to-gray-900/60 */}
      {/* Variant 2: from-primary/40 to-primary/60 */}
      {/* Variant 3: from-primary/40 to-secondary/60 */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-secondary/60" />
      <div className="absolute inset-0 p-3 flex flex-col justify-center">
        <h3 className="font-medium text-base text-white drop-shadow-md line-clamp-1">
          {title}
        </h3>
        <div className="text-xs text-white/90 drop-shadow-md mt-0.5">
          {organizationName}
        </div>
      </div>
    </div>
  )
}

export default ImageCardPart