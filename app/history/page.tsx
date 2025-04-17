"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy } from "lucide-react"

export default function GameHistory() {
  const router = useRouter()
  const [games, setGames] = useState<any[]>([])

  useEffect(() => {
    // Load games from localStorage
    const savedGames = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    setGames(savedGames.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-slate-600 py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Button variant="ghost" className="mr-2 p-1" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Game History</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No games played yet</p>
            <Button className="bg-white hover:bg-gray-200 text-black" onClick={() => router.push("/new-game")}>
              Start Your First Game
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-slate-600 p-4 rounded-lg cursor-pointer transition-colors"
                onClick={() =>
                  router.push(game.status === "completed" ? `/game/${game.id}/summary` : `/game/${game.id}`)
                }
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold">
                      {game.teamA} vs {game.teamB}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {game.date} at {game.time}
                    </p>
                  </div>
                  <div className="text-right">
                    {game.status === "completed" ? (
                      <div className="flex items-center">
                        {game.winner !== "Tie" && <Trophy className="h-4 w-4 mr-1" />}
                        <span className="font-medium">
                          {game.winner === "Tie" ? "Match Tied" : `${game.winner} won`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm bg-white text-black px-2 py-1 rounded">In Progress</span>
                    )}
                    <p className="text-sm mt-1">
                      {game.teamA} {game.scoreA}/{game.wicketsA} vs {game.teamB} {game.scoreB}/{game.wicketsB}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
