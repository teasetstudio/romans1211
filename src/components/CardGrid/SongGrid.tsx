import SongCard, { ISongCard } from './SongCard';

interface IProps {
  songs: Array<ISongCard>;
}

export default function SongGrid({ songs }: IProps) {
  return (
    <div className="container">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-6">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}
