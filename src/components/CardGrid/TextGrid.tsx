import TextCard, { ITextCard } from './TextCard';

interface IProps {
  texts: Array<ITextCard>;
}

export default function TextGrid({ texts }: IProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-6">
        {texts.map((text) => (
          <TextCard key={text.id} text={text} />
        ))}
      </div>
    </div>
  );
}
