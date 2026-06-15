"use client"

import { useState } from "react"
import { Minus, Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type Player, createId, TOTAL_ROUNDS } from "@/lib/zap"

const MIN_PLAYERS = 2
const MAX_PLAYERS = 8

type SetupScreenProps = {
  onStart: (players: Player[]) => void
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [names, setNames] = useState<string[]>(["", ""])

  function setCount(next: number) {
    const clamped = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, next))
    setNames((prev) => {
      const copy = [...prev]
      if (clamped > copy.length) {
        while (copy.length < clamped) copy.push("")
      } else {
        copy.length = clamped
      }
      return copy
    })
  }

  function updateName(index: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)))
  }

  function handleStart() {
    const players: Player[] = names.map((name, i) => ({
      id: createId(),
      name: name.trim() || `Player ${i + 1}`,
    }))
    onStart(players)
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <header className="mb-8 -mx-4 bg-gradient-to-br from-card to-[oklch(0.2_0.08_288)] border-b border-border px-4 py-8 rounded-b-xl flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Zap className="size-8" fill="currentColor" aria-hidden="true" />
        </div>
        <h1 className="text-pretty text-3xl font-bold tracking-tight">Zap Score Tracker</h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Lowest hand calls a show. {TOTAL_ROUNDS} rounds from 13 cards down to 1 and back up to 13.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <Label className="text-base">Players</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="size-11 rounded-xl"
              onClick={() => setCount(names.length - 1)}
              disabled={names.length <= MIN_PLAYERS}
              aria-label="Remove a player"
            >
              <Minus className="size-5" />
            </Button>
            <span className="w-6 text-center text-xl font-semibold tabular-nums">{names.length}</span>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="size-11 rounded-xl"
              onClick={() => setCount(names.length + 1)}
              disabled={names.length >= MAX_PLAYERS}
              aria-label="Add a player"
            >
              <Plus className="size-5" />
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {names.map((name, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-secondary-foreground tabular-nums">
                {i + 1}
              </span>
              <Input
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                className="h-12 text-base"
                aria-label={`Name for player ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </section>

      <Button onClick={handleStart} className="mt-6 h-14 w-full rounded-xl text-base font-semibold">
        Start Game
      </Button>
    </div>
  )
}
