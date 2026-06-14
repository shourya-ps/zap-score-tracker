"use client"

import { Crown } from "lucide-react"
import { type Game, computeStandings } from "@/lib/zap"

type ScoreboardProps = {
  game: Game
  highlightLeader?: boolean
}

export function Scoreboard({ game, highlightLeader = true }: ScoreboardProps) {
  const standings = computeStandings(game)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Standings · lowest wins
      </h2>
      <div className="flex flex-col gap-2">
        {standings.map(({ player, total, rank }) => {
          const isLeader = highlightLeader && rank === 1 && game.results.length > 0
          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                isLeader ? "bg-primary/15 ring-1 ring-primary/40" : "bg-secondary/40"
              }`}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background text-sm font-bold tabular-nums">
                {rank}
              </span>
              <span className="flex-1 truncate font-medium">{player.name}</span>
              {isLeader && <Crown className="size-4 text-primary" aria-label="Leading" />}
              <span className="text-lg font-bold tabular-nums">{total}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
