"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NewGame() {
  const [teamA, setTeamA] = useState("")
  const [teamB, setTeamB] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!teamA.trim() || !teamB.trim()) {
      setError("Both team names are required")
      return
    }

    if (teamA.trim() === teamB.trim()) {
      setError("Team names must be different")
      return
    }

    const gameId = Date.now().toString()
    const gameData = {
      id: gameId,
      teamA: teamA.trim(),
      teamB: teamB.trim(),
      startTime: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "in-progress",
      scoreA: 0,
      wicketsA: 0,
      oversA: 0,
      ballsA: 0,
      scoreB: 0,
      wicketsB: 0,
      oversB: 0,
      ballsB: 0,
      currentBattingTeam: "A",
      winner: null,
      extras: { wideA: 0, noBallA: 0, wideB: 0, noBallB: 0 },
    }

    // Save to localStorage
    const games = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    games.push(gameData)
    localStorage.setItem("cricketGames", JSON.stringify(games))

    // Navigate to the game page
    router.push(`/game/${gameId}`)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">New Cricket Match</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamA">Team 1 Name</Label>
                <Input
                  id="teamA"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  className="text-black border-white focus:ring-black bg-gray-200"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <Label htmlFor="teamB">Team 2 Name</Label>
                <Input
                  id="teamB"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  className="text-black border-white focus:ring-black bg-gray-200"
                  placeholder="Enter team name"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="space-y-4">
              <Button type="submit" className="w-full font-bold bg-white hover:bg-gray-200 text-black">
                Start Game
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-white text-black hover:bg-gray-900"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
