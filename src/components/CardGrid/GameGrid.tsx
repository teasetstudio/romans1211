import GameCard, { IGameCard } from './GameCard';

interface IProps {
  games: Array<IGameCard>;
}

export default function GameGrid({ games }: IProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
