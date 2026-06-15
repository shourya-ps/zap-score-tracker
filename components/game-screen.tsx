"use client"

import { useState } from "react"
import { Flag, RotateCcw, Trophy, Undo2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Scoreboard } from "@/components/scoreboard"
import { RoundEntry } from "@/components/round-entry"
import {
  type Game,
  type RoundResult,
  ROUND_SEQUENCE,
  TOTAL_ROUNDS,
  computeStandings,
} from "@/lib/zap"

type GameScreenProps = {
  game: Game
  onSubmitRound: (result: RoundResult) => void
  onUndo: () => void
  onFinish: () => void
  onNewGame: () => void
}

export function GameScreen({
  game,
  onSubmitRound,
  onUndo,
  onFinish,
  onNewGame,
}: GameScreenProps) {
  const [confirmNew, setConfirmNew] = useState(false)
  const playedRounds = game.results.length
  const allRoundsPlayed = playedRounds >= TOTAL_ROUNDS
  const isFinished = game.status === "finished" || allRoundsPlayed

  const currentRoundIndex = playedRounds
  const currentCardCount = ROUND_SEQUENCE[currentRoundIndex]

  const standings = computeStandings(game)
  const winner = standings[0]

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <header className="bg-gradient-to-br from-card to-[oklch(0.2_0.08_288)] border-b border-border px-4 py-4 -mx-4 mb-5 rounded-b-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="size-5" fill="currentColor" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Zap</p>
            <p className="text-xs text-muted-foreground">
              {playedRounds} / {TOTAL_ROUNDS} rounds played
            </p>
          </div>
        </div>
        {playedRounds > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onUndo}
            className="text-muted-foreground"
          >
            <Undo2 className="size-4" /> Undo
          </Button>
        )}
      </header>

      {isFinished ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center rounded-2xl border border-primary/40 bg-primary/10 p-6 text-center">
            <Trophy className="size-9 text-primary" aria-hidden="true" />
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {allRoundsPlayed ? "Final winner" : "Winner so far"}
            </p>
            <p className="mt-1 text-2xl font-bold">{winner?.player.name}</p>
            <p className="text-sm text-muted-foreground">
              {winner?.total} points after {playedRounds}{" "}
              {playedRounds === 1 ? "round" : "rounds"}
            </p>
          </div>

          <Scoreboard game={game} />
          <RoundHistory game={game} />

          {confirmNew ? (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm">Start a new game? Current scores will be cleared.</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Button variant="secondary" className="h-12 rounded-xl" onClick={() => setConfirmNew(false)}>
                  Cancel
                </Button>
                <Button className="h-12 rounded-xl" onClick={onNewGame}>
                  New Game
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setConfirmNew(true)}
              className="h-14 w-full rounded-xl text-base font-semibold"
            >
              <RotateCcw className="size-5" /> New Game
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <RoundEntry
            key={currentRoundIndex}
            players={game.players}
            roundIndex={currentRoundIndex}
            cardCount={currentCardCount}
            roundNumber={playedRounds + 1}
            totalRounds={TOTAL_ROUNDS}
            onSubmit={onSubmitRound}
          />

          <Scoreboard game={game} />

          {playedRounds > 0 && <RoundHistory game={game} />}

          <Button
            type="button"
            variant="outline"
            onClick={onFinish}
            className="h-12 w-full rounded-xl"
          >
            <Flag className="size-4" /> Stop game &amp; see totals
          </Button>
        </div>
      )}
    </div>
  )
}

function RoundHistory({ game }: { game: Game }) {
  if (game.results.length === 0) return null
  const callerName = (id: string) =>
    game.players.find((p) => p.id === id)?.name ?? "—"

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Round history
      </h2>
      <div className="flex flex-col gap-2">
        {[...game.results]
          .reverse()
          .map((result) => (
            <div
              key={result.roundIndex}
              className="rounded-xl bg-secondary/40 p-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {result.cardCount} {result.cardCount === 1 ? "card" : "cards"}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    result.correct ? "text-primary" : "text-destructive"
                  }`}
                >
                  {callerName(result.callerId)} called ·{" "}
                  {result.correct ? "correct" : "wrong"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {game.players.map((p) => (
                  <span key={p.id} className="text-xs text-muted-foreground">
                    {p.name}:{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {result.scores[p.id] > 0 ? "+" : ""}
                      {result.scores[p.id]}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
