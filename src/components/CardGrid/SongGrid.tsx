import SongCard, { ISongCard } from './SongCard';

interface IProps {
  songs: Array<ISongCard>;
}

export default function SongGrid({ songs }: IProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}
