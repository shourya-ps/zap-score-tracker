export type Player = {
  id: string
  name: string
}

export type RoundResult = {
  /** index into the rounds sequence */
  roundIndex: number
  /** number of cards dealt this round */
  cardCount: number
  /** player id who called the show */
  callerId: string
  /** whether the caller actually had the lowest value */
  correct: boolean
  /** raw hand value (points) entered per player */
  hands: Record<string, number>
  /** computed score delta applied this round per player */
  scores: Record<string, number>
}

export type GameStatus = "setup" | "playing" | "finished"

export type Game = {
  players: Player[]
  results: RoundResult[]
  status: GameStatus
}

/** Bonus the caller receives for a correct show. */
export const CORRECT_CALL_BONUS = -10

/**
 * Build the full Zap round sequence: cards go from 13 down to 1,
 * then back up from 2 to 13. Total of 25 rounds.
 */
export function buildRoundSequence(): number[] {
  const down: number[] = []
  for (let i = 13; i >= 1; i--) down.push(i)
  const up: number[] = []
  for (let i = 2; i <= 13; i++) up.push(i)
  return [...down, ...up]
}

export const ROUND_SEQUENCE = buildRoundSequence()
export const TOTAL_ROUNDS = ROUND_SEQUENCE.length

/**
 * Compute the score delta for each player in a round.
 *
 * Correct call:  caller = -10, everyone else = the points in their hand.
 * Wrong call:    everyone else = 0, caller = the highest hand points at the table.
 */
export function computeRoundScores(
  players: Player[],
  callerId: string,
  correct: boolean,
  hands: Record<string, number>,
): Record<string, number> {
  const scores: Record<string, number> = {}
  const values = players.map((p) => hands[p.id] ?? 0)
  const highest = values.length ? Math.max(...values) : 0

  for (const player of players) {
    const hand = hands[player.id] ?? 0
    if (correct) {
      scores[player.id] = player.id === callerId ? CORRECT_CALL_BONUS : hand
    } else {
      scores[player.id] = player.id === callerId ? highest : 0
    }
  }
  return scores
}

/** Sum every round's score delta into a per-player total. */
export function computeTotals(game: Game): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const player of game.players) totals[player.id] = 0
  for (const result of game.results) {
    for (const player of game.players) {
      totals[player.id] += result.scores[player.id] ?? 0
    }
  }
  return totals
}

export type Standing = {
  player: Player
  total: number
  rank: number
}

/** Players ranked by total, lowest score first (lower is better in Zap). */
export function computeStandings(game: Game): Standing[] {
  const totals = computeTotals(game)
  const sorted = [...game.players].sort(
    (a, b) => totals[a.id] - totals[b.id],
  )
  const standings: Standing[] = []
  let rank = 0
  let prevTotal: number | null = null
  sorted.forEach((player, index) => {
    const total = totals[player.id]
    if (prevTotal === null || total !== prevTotal) {
      rank = index + 1
      prevTotal = total
    }
    standings.push({ player, total, rank })
  })
  return standings
}

export function createId(): string {
  return Math.random().toString(36).slice(2, 10)
}
