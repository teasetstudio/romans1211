import React from 'react'

import Button from '@/components/buttons/Button'
import H3 from '@/components/typo/H3'
import H8 from '@/components/typo/H8'
import H9 from '@/components/typo/H9'
import Gradient from '@/components/widgets/ui/Gradient'

interface MediaTypeCardProps {
  mediaType: string
  description: string
  url: string
  ctaLabel: string
}

const MediaTypeCard: React.FC<MediaTypeCardProps> = ({
  mediaType,
  description,
  url,
  ctaLabel,
}) => {
  return (
    <div className="mx-auto w-full sm:w-2/3 lg:w-full h-64 lg:h-72 px-6 lg:px-12 pb-8 lg:pb-14 pt-8 lg:pt-10 flex flex-col items-center lg:items-start bg-dark rounded-3xl border border-gray3 relative overflow-hidden">
      <H3
        color="text-white"
        fontSize="text-2xl lg:text-3xl"
        className="mb-1 relative z-10"
      >
        {mediaType}
      </H3>

      <div className="h-full flex flex-col justify-between relative z-10">
        <H8
          color="text-gray2"
          fontSize="text-tiny"
          className="text-center lg:text-left mt-2"
        >
          {description}
        </H8>

        <Button
          href={url}
          className="w-40 mx-auto lg:mx-0"
          bgColor="bg-gray4"
          paddingClass="py-3"
        >
          <H9 weight="semibold">{ctaLabel}</H9>
        </Button>
      </div>

      <Gradient className="top-[-900px] right-[-350px] z-0 w-[800px] h-[1400px]" />
    </div>
  )
}

export default MediaTypeCard
