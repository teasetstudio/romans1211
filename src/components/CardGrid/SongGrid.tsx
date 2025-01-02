import SongCard from './SongCard';

interface SongGridProps {
  songs: Array<{
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

export default function SongGrid({ songs }: SongGridProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {songs.map((song) => (
          <SongCard
            key={song.id}
            id={song.id}
            title={song.title}
            content={song.content}
            imageUrl={song.imageUrl}
            organizationName={song.metadata.organization}
            createdAt={song.metadata.date}
            tags={song.tags}
          />
        ))}
      </div>
    </div>
  );
}
