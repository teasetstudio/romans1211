import TextCard from './TextCard';

interface TextGridProps {
  texts: Array<{
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    metadata: {
      organization: string;
      date: string;
    };
    tags?: { name: string }[];
  }>;
}

export default function TextGrid({ texts }: TextGridProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {texts.map((text) => (
          <TextCard
            key={text.id}
            id={text.id}
            title={text.title}
            content={text.content}
            imageUrl={text.imageUrl}
            organizationName={text.metadata.organization}
            createdAt={text.metadata.date}
            tags={text.tags}
          />
        ))}
      </div>
    </div>
  );
}
