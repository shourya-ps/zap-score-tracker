"use client"

import { useEffect, useState } from "react"
import { SetupScreen } from "@/components/setup-screen"
import { GameScreen } from "@/components/game-screen"
import { type Game, type Player, type RoundResult } from "@/lib/zap"

const STORAGE_KEY = "zap-game-v1"

export default function Page() {
  const [game, setGame] = useState<Game | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Restore an in-progress game on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Game
        if (parsed?.players?.length) setGame(parsed)
      }
    } catch {
      // ignore malformed storage
    }
    setLoaded(true)
  }, [])

  // Persist whenever the game changes.
  useEffect(() => {
    if (!loaded) return
    try {
      if (game) localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore quota errors
    }
  }, [game, loaded])

  function startGame(players: Player[]) {
    setGame({ players, results: [], status: "playing" })
  }

  function submitRound(result: RoundResult) {
    setGame((prev) =>
      prev ? { ...prev, results: [...prev.results, result] } : prev,
    )
  }

  function undoRound() {
    setGame((prev) =>
      prev
        ? { ...prev, results: prev.results.slice(0, -1), status: "playing" }
        : prev,
    )
  }

  function finishGame() {
    setGame((prev) => (prev ? { ...prev, status: "finished" } : prev))
  }

  function newGame() {
    setGame(null)
  }

  if (!loaded) {
    return <main className="min-h-screen bg-background" aria-hidden="true" />
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {game ? (
        <GameScreen
          game={game}
          onSubmitRound={submitRound}
          onUndo={undoRound}
          onFinish={finishGame}
          onNewGame={newGame}
        />
      ) : (
        <SetupScreen onStart={startGame} />
      )}
    </main>
  )
}
