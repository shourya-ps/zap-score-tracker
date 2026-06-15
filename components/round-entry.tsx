"use client"

import { useMemo, useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type Player,
  type RoundResult,
  computeRoundScores,
} from "@/lib/zap"

type RoundEntryProps = {
  players: Player[]
  roundIndex: number
  cardCount: number
  roundNumber: number
  totalRounds: number
  onSubmit: (result: RoundResult) => void
}

export function RoundEntry({
  players,
  roundIndex,
  cardCount,
  roundNumber,
  totalRounds,
  onSubmit,
}: RoundEntryProps) {
  const [callerId, setCallerId] = useState<string | null>(null)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [handInputs, setHandInputs] = useState<Record<string, string>>({})
  const [wrongMaxInput, setWrongMaxInput] = useState("")

  const hands = useMemo(() => {
    if (correct === false && callerId) {
      const n = Number.parseInt(wrongMaxInput, 10)
      const max = Number.isFinite(n) ? n : 0
      const result: Record<string, number> = {}
      for (const p of players) result[p.id] = p.id === callerId ? max : 0
      return result
    }
    const parsed: Record<string, number> = {}
    for (const p of players) {
      const raw = handInputs[p.id]
      const n = Number.parseInt(raw ?? "", 10)
      parsed[p.id] = Number.isFinite(n) ? n : 0
    }
    return parsed
  }, [handInputs, wrongMaxInput, correct, callerId, players])

  const preview = useMemo(() => {
    if (!callerId || correct === null) return null
    return computeRoundScores(players, callerId, correct, hands)
  }, [callerId, correct, hands, players])

  const canSubmit = callerId !== null && correct !== null

  function handleSubmit() {
    if (!callerId || correct === null) return
    onSubmit({
      roundIndex,
      cardCount,
      callerId,
      correct,
      hands,
      scores: computeRoundScores(players, callerId, correct, hands),
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Round {roundNumber} of {totalRounds}
          </p>
          <p className="text-xl font-bold">
            {cardCount} {cardCount === 1 ? "card" : "cards"} each
          </p>
        </div>
      </div>

      <div className="mt-5">
        {correct === false ? (
          <>
            <Label className="text-sm text-muted-foreground">Who called the show?</Label>
            <div className="mt-2 flex flex-col gap-2">
              {players.map((p) => {
                const isCaller = callerId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCallerId(isCaller ? null : p.id)}
                    className={`flex h-11 w-full items-center justify-between rounded-xl border border-border px-3 text-left text-sm font-semibold transition-colors ${
                      isCaller
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/40 text-foreground hover:bg-secondary"
                    }`}
                    aria-pressed={isCaller}
                  >
                    <span className="truncate">{p.name}</span>
                    {isCaller && <span className="ml-2 shrink-0 text-xs font-bold uppercase">Called</span>}
                  </button>
                )
              })}
            </div>
            <div className="mt-4">
              <Label className="text-sm text-muted-foreground">Highest hand value (added to caller)</Label>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={wrongMaxInput}
                onChange={(e) => setWrongMaxInput(e.target.value)}
                placeholder="0"
                className="mt-2 h-12 text-center text-base"
                aria-label="Highest hand value this round"
              />
            </div>
          </>
        ) : (
          <>
            <Label className="text-sm text-muted-foreground">Points in each hand</Label>
            <div className="mt-2 flex flex-col gap-2">
              {players.map((p) => {
                const isCaller = callerId === p.id
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-2 pl-3"
                  >
                    <button
                      type="button"
                      onClick={() => setCallerId(isCaller ? null : p.id)}
                      className={`flex h-11 flex-1 items-center justify-between rounded-lg px-3 text-left text-sm font-semibold transition-colors ${
                        isCaller
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-secondary"
                      }`}
                      aria-pressed={isCaller}
                    >
                      <span className="truncate">{p.name}</span>
                      {isCaller && <span className="ml-2 shrink-0 text-xs font-bold uppercase">Called</span>}
                    </button>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={handInputs[p.id] ?? ""}
                      onChange={(e) =>
                        setHandInputs((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      placeholder="0"
                      className="h-11 w-20 text-center text-base"
                      aria-label={`Points in ${p.name}'s hand`}
                    />
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Tap a name to mark who called the show.
            </p>
          </>
        )}
      </div>

      <div className="mt-5">
        <Label className="text-sm text-muted-foreground">Was the call correct?</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={correct === true ? "default" : "secondary"}
            className="h-12 rounded-xl text-sm font-semibold"
            onClick={() => setCorrect(true)}
            disabled={!callerId}
          >
            <Check className="size-4" /> Correct (-10)
          </Button>
          <Button
            type="button"
            variant={correct === false ? "destructive" : "secondary"}
            className="h-12 rounded-xl text-sm font-semibold"
            onClick={() => setCorrect(false)}
            disabled={!callerId}
          >
            <X className="size-4" /> Wrong
          </Button>
        </div>
      </div>

      {preview && callerId && (
        <div className="mt-5 rounded-xl bg-secondary/50 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            This round
          </p>
          <div className="flex flex-col gap-1.5">
            {players.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className={p.id === callerId ? "font-semibold text-primary" : ""}>
                  {p.name}
                </span>
                <span className="font-semibold tabular-nums">
                  {preview[p.id] > 0 ? "+" : ""}
                  {preview[p.id]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-5 h-14 w-full rounded-xl text-base font-semibold"
      >
        {roundNumber === totalRounds ? "Save Round & Finish" : "Save Round"}
      </Button>
    </div>
  )
}
