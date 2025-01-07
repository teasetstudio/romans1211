import Card, { ICard } from './Card';

interface CardGridProps {
  cards: Array<ICard>;
}

export default function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-6">
        {cards.map((card) => <Card key={card.id} card={card} />)}
      </div>
    </div>
  );
}
