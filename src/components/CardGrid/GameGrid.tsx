import GameCard, { IGameCard } from './GameCard';

interface IProps {
  games: Array<IGameCard>;
}

export default function GameGrid({ games }: IProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
