"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowLeft, Share2 } from "lucide-react"

export default function GameSummary({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load game data from localStorage
    const games = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    const currentGame = games.find((g: any) => g.id === params.id)

    if (currentGame && currentGame.status === "completed") {
      setGame(currentGame)
    } else {
      router.push("/")
    }

    setLoading(false)
  }, [params.id, router])

  if (loading || !game) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading match summary...</p>
      </div>
    )
  }

  const shareResult = () => {
    const text = `Cricket Match Result: ${game.teamA} ${game.scoreA}/${game.wicketsA} vs ${game.teamB} ${game.scoreB}/${game.wicketsB}. Winner: ${game.winner}`

    if (navigator.share) {
      navigator
        .share({
          title: "Cricket Match Result",
          text: text,
        })
        .catch(console.error)
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert("Result copied to clipboard!")
        })
        .catch(console.error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Button variant="ghost" className="mr-2 p-1" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Match Summary</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-600 p-6 rounded-lg mb-6 text-center">
            <h2 className="text-xl font-bold mb-2">
              {game.teamA} vs {game.teamB}
            </h2>
            <p className="text-gray-400 mb-6">
              {game.date} at {game.time}
            </p>

            {game.winner !== "Tie" ? (
              <div className="flex flex-col items-center">
                <Trophy className="h-12 w-12 mb-2" />
                <p className="text-2xl font-bold">{game.winner} won!</p>
              </div>
            ) : (
              <p className="text-2xl font-bold">Match Tied!</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-600 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">{game.teamA}</h3>
              <p className="text-3xl font-bold mb-2">
                {game.scoreA}/{game.wicketsA}
              </p>
              <p>
                Overs: {game.oversA}.{game.ballsA}
              </p>
              <p>
                Extras: {game.extras.wideA + game.extras.noBallA} (Wide: {game.extras.wideA}, No Ball:{" "}
                {game.extras.noBallA})
              </p>
            </div>

            <div className="bg-slate-600 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">{game.teamB}</h3>
              <p className="text-3xl font-bold mb-2">
                {game.scoreB}/{game.wicketsB}
              </p>
              <p>
                Overs: {game.oversB}.{game.ballsB}
              </p>
              <p>
                Extras: {game.extras.wideB + game.extras.noBallB} (Wide: {game.extras.wideB}, No Ball:{" "}
                {game.extras.noBallB})
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full bg-white hover:bg-gray-200 text-black font-bold" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
