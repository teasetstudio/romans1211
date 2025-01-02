import React from 'react'

import Button from '@/components/buttons/Button'
import H3 from '@/components/typo/H3'
import H8 from '@/components/typo/H8'
import H9 from '@/components/typo/H9'
import Gradient from '@/components/ui/Gradient'

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
    <div className="mx-auto w-full sm:w-2/3 lg:w-full h-72 lg:h-[340px] px-8 lg:px-16 pb-12 lg:pb-24 pt-11 lg:pt-16 flex flex-col items-center lg:items-start bg-dark rounded-[36px] border border-gray3 relative overflow-hidden">
      <H3
        color="text-white"
        fontSize="text-3xl"
        className="lg:mb-6 mb-2 relative z-10"
      >
        {mediaType}
      </H3>

      <div className="h-full flex flex-col justify-between relative z-10">
        <H8
          color="text-gray2"
          fontSize="text-tiny"
          className="text-center lg:text-left"
        >
          {description}
        </H8>

        <Button
          href={url}
          className="w-44 mx-auto lg:mx-0"
          bgColor="bg-gray4"
          paddingClass="py-4"
        >
          <H9 weight="semibold">{ctaLabel}</H9>
        </Button>
      </div>

      <Gradient className="top-[-1200px] right-[-450px] z-0 w-[1000px] h-[1800px]" />
    </div>
  )
}

export default MediaTypeCard
