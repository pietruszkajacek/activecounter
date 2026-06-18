import React, { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';

type Props = {
  slides: number[] | undefined;
  options?: EmblaOptionsType;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
};

export function EmblaCarousel({ slides, options, setSelectedMonth } : Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);


  const handleSelectEvent = useCallback(
    (emblaApi: EmblaCarouselType) => {
      setSelectedMonth(emblaApi.selectedScrollSnap());
    },
    []
  );

  useEffect(() => {
    if (emblaApi) emblaApi.on("select", handleSelectEvent);
  }, [emblaApi, handleSelectEvent]);

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        {slides?.map((value, index) => (
          <div
            className="embla__slide mx-auto flex flex-col gap-y-4"
            key={index}
          >
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}
