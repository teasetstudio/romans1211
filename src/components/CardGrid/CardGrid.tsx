import Card, { ICard } from './Card';

interface CardGridProps {
  cards: Array<ICard>;
}

export default function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card) => <Card key={card.id} card={card} />)}
      </div>
    </div>
  );
}
