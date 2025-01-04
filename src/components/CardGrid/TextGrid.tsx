import TextCard, { ITextCard } from './TextCard';

interface IProps {
  texts: Array<ITextCard>;
}

export default function TextGrid({ texts }: IProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {texts.map((text) => (
          <TextCard key={text.id} text={text} />
        ))}
      </div>
    </div>
  );
}
