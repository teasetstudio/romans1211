import GameCard from './GameCard';

interface GameGridProps {
  games: Array<{
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

export default function GameGrid({ games }: GameGridProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {games.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            title={game.title}
            content={game.content}
            imageUrl={game.imageUrl}
            organizationName={game.metadata.organization}
            createdAt={game.metadata.date}
            tags={game.tags}
          />
        ))}
      </div>
    </div>
  );
}
