"use client"

import { useState } from "react";
type UsageItem = {
  id: string;
  title: string;
  count: number; // number of times used (across plan items)
  lastUsedAt?: number; // epoch ms
};

interface Totals {
  songs: number;
  texts: number;
  games: number;
  custom: number;
}

interface Uniques {
  songs: number;
  texts: number;
  games: number;
}

interface Props {
  totals: Totals;
  uniques: Uniques;
  songs: UsageItem[];
  texts: UsageItem[];
  games: UsageItem[];
  songEvents: { id: string; title: string; usedAt: number; eventTitle: string }[];
  textEvents: { id: string; title: string; usedAt: number; eventTitle: string }[];
  gameEvents: { id: string; title: string; usedAt: number; eventTitle: string }[];
}

export default function MaterialUsageSummary({ totals, uniques, songs, texts, games, songEvents, textEvents, gameEvents }: Props) {
  const [songsSortByLatest, setSongsSortByLatest] = useState(false);
  const [textsSortByLatest, setTextsSortByLatest] = useState(false);
  const [gamesSortByLatest, setGamesSortByLatest] = useState(false);

  const sortItems = (items: UsageItem[]) => {
    const sorted = [...items];
    // Default: title asc, then count desc
    sorted.sort((a, b) => {
      const t = a.title.localeCompare(b.title);
      if (t !== 0) return t;
      return b.count - a.count;
    });
    return sorted;
  };

  const sortEvents = (events: { id: string; title: string; usedAt: number; eventTitle: string }[]) => {
    const sorted = [...events];
    // Sort by usedAt desc, then title asc
    sorted.sort((a, b) => {
      if (b.usedAt !== a.usedAt) return b.usedAt - a.usedAt;
      return a.title.localeCompare(b.title);
    });
    return sorted;
  };

  const renderList = (items: UsageItem[], byLatest: boolean, events?: { id: string; title: string; usedAt: number; eventTitle: string }[]) => {
    if (items.length === 0) return (
      <div className="text-sm text-muted-foreground">No items</div>
    );
    if (byLatest && events) {
      const sorted = sortEvents(events);
      return (
        <ul className="mt-2 max-h-64 overflow-auto divide-y rounded-md border bg-background">
          {sorted.map((ev, idx) => (
            <li key={`${ev.id}-${ev.usedAt}-${idx}`} className="flex items-center justify-between px-3 py-2">
              <div className="flex min-w-0 flex-col pr-3">
                <span className="truncate" title={ev.title}>{ev.title || "Untitled"}</span>
                <span className="text-xs text-muted-foreground mt-0.5 truncate" title={ev.eventTitle}>
                  Used in {ev.eventTitle}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(ev.usedAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      );
    }
    const sorted = sortItems(items);
    return (
      <ul className="mt-2 max-h-64 overflow-auto divide-y rounded-md border bg-background">
        {sorted.map(item => (
          <li key={item.id} className="flex items-center justify-between px-3 py-2">
            <span className="truncate pr-3" title={item.title}>{item.title || "Untitled"}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">Used {item.count}x</span>
          </li>
        ))}
      </ul>
    );
  };

  const copyList = async (items: UsageItem[], byLatest: boolean, events?: { id: string; title: string; usedAt: number; eventTitle: string }[]) => {
    if (byLatest && events) {
      const sorted = sortEvents(events);
      const lines = sorted.map(ev => `${ev.title || 'Untitled'}  ${new Date(ev.usedAt).toLocaleDateString()}  (${ev.eventTitle})`);
      const text = lines.join('\n');
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
        } finally {
          document.body.removeChild(textarea);
        }
      }
      return;
    }
    const sorted = sortItems(items);
    const lines = sorted.map(it => `${it.title || 'Untitled'}  ${it.count}x`);
    const text = lines.join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-md border p-3">
          <div className="text-sm text-muted-foreground">Songs used</div>
          <div className="text-2xl font-semibold">{totals.songs}</div>
          <div className="text-xs text-muted-foreground mt-1">Unique songs: {uniques.songs}</div>
          <div className="mt-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md border px-2 py-1 text-sm hover:bg-accent"
              onClick={() => void copyList(songs, songsSortByLatest, songEvents)}
              aria-label="Copy songs list"
            >
              Copy
            </button>
            <button
              type="button"
              className="ml-2 inline-flex items-center rounded-md border px-2 py-1 text-sm hover:bg-accent"
              onClick={() => setSongsSortByLatest(s => !s)}
              aria-label="Toggle songs sort"
            >
              {songsSortByLatest ? 'Sort by title' : 'Sort by latest'}
            </button>
          </div>
          <div className="mt-2">
            {renderList(songs, songsSortByLatest, songEvents)}
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="text-sm text-muted-foreground">Texts used</div>
          <div className="text-2xl font-semibold">{totals.texts}</div>
          <div className="text-xs text-muted-foreground mt-1">Unique texts: {uniques.texts}</div>
          <div className="mt-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md border px-2 py-1 text-sm hover:bg-accent"
              onClick={() => void copyList(texts, textsSortByLatest, textEvents)}
              aria-label="Copy texts list"
            >
              Copy
            </button>
            <button
              type="button"
              className="ml-2 inline-flex items-center rounded-md border px-2 py-1 text-sm hover:bg-accent"
              onClick={() => setTextsSortByLatest(s => !s)}
              aria-label="Toggle texts sort"
            >
              {textsSortByLatest ? 'Sort by title' : 'Sort by latest'}
            </button>
          </div>
          <div className="mt-2">
            {renderList(texts, textsSortByLatest, textEvents)}
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="text-sm text-muted-foreground">Games used</div>
          <div className="text-2xl font-semibold">{totals.games}</div>
          <div className="text-xs text-muted-foreground mt-1">Unique games: {uniques.games}</div>
          <div className="mt-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md border px-2 py-1 text-sm hover:bg-accent"
              onClick={() => void copyList(games, gamesSortByLatest, gameEvents)}
              aria-label="Copy games list"
            >
              Copy
            </button>
            <button
              type="button"
              className="ml-2 inline-flex items-center rounded-md border px-2 py-1 text-sm hover:bg-accent"
              onClick={() => setGamesSortByLatest(s => !s)}
              aria-label="Toggle games sort"
            >
              {gamesSortByLatest ? 'Sort by title' : 'Sort by latest'}
            </button>
          </div>
          <div className="mt-2">
            {renderList(games, gamesSortByLatest, gameEvents)}
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="text-sm text-muted-foreground">Custom items</div>
          <div className="text-2xl font-semibold">{totals.custom}</div>
        </div>
      </div>
    </div>
  );
}
