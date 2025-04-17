"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"

export default function GamePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [customRunsOpen, setCustomRunsOpen] = useState(false)
  const [customRuns, setCustomRuns] = useState("")
  const [endGameOpen, setEndGameOpen] = useState(false)

  useEffect(() => {
    // Load game data from localStorage
    const games = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    const currentGame = games.find((g: any) => g.id === params.id)

    if (currentGame) {
      setGame(currentGame)
    } else {
      router.push("/")
    }

    setLoading(false)
  }, [params.id, router])

  if (loading || !game) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading match data...</p>
      </div>
    )
  }

  const currentTeam = game.currentBattingTeam === "A" ? game.teamA : game.teamB
  const currentScore = game.currentBattingTeam === "A" ? game.scoreA : game.scoreB
  const currentWickets = game.currentBattingTeam === "A" ? game.wicketsA : game.wicketsB
  const currentOvers = game.currentBattingTeam === "A" ? game.oversA : game.oversB
  const currentBalls = game.currentBattingTeam === "A" ? game.ballsA : game.ballsB

  const updateScore = (runs: number, isExtra = false, extraType = "") => {
    const games = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    const gameIndex = games.findIndex((g: any) => g.id === params.id)

    if (gameIndex !== -1) {
      const updatedGame = { ...games[gameIndex] }

      if (updatedGame.currentBattingTeam === "A") {
        updatedGame.scoreA += runs

        if (extraType === "wide") {
          updatedGame.extras.wideA += 1
        } else if (extraType === "noBall") {
          updatedGame.extras.noBallA += 1
        } else if (!isExtra) {
          updatedGame.ballsA += 1
          if (updatedGame.ballsA === 6) {
            updatedGame.oversA += 1
            updatedGame.ballsA = 0
          }
        }
      } else {
        updatedGame.scoreB += runs

        if (extraType === "wide") {
          updatedGame.extras.wideB += 1
        } else if (extraType === "noBall") {
          updatedGame.extras.noBallB += 1
        } else if (!isExtra) {
          updatedGame.ballsB += 1
          if (updatedGame.ballsB === 6) {
            updatedGame.oversB += 1
            updatedGame.ballsB = 0
          }
        }
      }

      games[gameIndex] = updatedGame
      localStorage.setItem("cricketGames", JSON.stringify(games))
      setGame(updatedGame)
    }
  }

  const addWicket = () => {
    const games = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    const gameIndex = games.findIndex((g: any) => g.id === params.id)

    if (gameIndex !== -1) {
      const updatedGame = { ...games[gameIndex] }

      if (updatedGame.currentBattingTeam === "A") {
        updatedGame.wicketsA += 1
        updatedGame.ballsA += 1

        if (updatedGame.ballsA === 6) {
          updatedGame.oversA += 1
          updatedGame.ballsA = 0
        }

        // Check if all wickets are down
        if (updatedGame.wicketsA === 10) {
          updatedGame.currentBattingTeam = "B"
        }
      } else {
        updatedGame.wicketsB += 1
        updatedGame.ballsB += 1

        if (updatedGame.ballsB === 6) {
          updatedGame.oversB += 1
          updatedGame.ballsB = 0
        }

        // Check if all wickets are down or if team B has scored more than team A
        if (updatedGame.wicketsB === 10 || updatedGame.scoreB > updatedGame.scoreA) {
          endGame(updatedGame)
          return
        }
      }

      games[gameIndex] = updatedGame
      localStorage.setItem("cricketGames", JSON.stringify(games))
      setGame(updatedGame)
    }
  }

  const switchInnings = () => {
    const games = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    const gameIndex = games.findIndex((g: any) => g.id === params.id)

    if (gameIndex !== -1) {
      const updatedGame = { ...games[gameIndex] }
      updatedGame.currentBattingTeam = updatedGame.currentBattingTeam === "A" ? "B" : "A"

      games[gameIndex] = updatedGame
      localStorage.setItem("cricketGames", JSON.stringify(games))
      setGame(updatedGame)
    }
  }

  const handleCustomRuns = () => {
    const runs = Number.parseInt(customRuns)
    if (!isNaN(runs) && runs > 0) {
      updateScore(runs)
      setCustomRunsOpen(false)
      setCustomRuns("")
    }
  }

  const endGame = (gameData = game) => {
    const games = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    const gameIndex = games.findIndex((g: any) => g.id === gameData.id)

    if (gameIndex !== -1) {
      const updatedGame = { ...gameData }
      updatedGame.status = "completed"
      updatedGame.endTime = new Date().toISOString()

      // Determine winner
      if (updatedGame.scoreA > updatedGame.scoreB) {
        updatedGame.winner = updatedGame.teamA
      } else if (updatedGame.scoreB > updatedGame.scoreA) {
        updatedGame.winner = updatedGame.teamB
      } else {
        updatedGame.winner = "Tie"
      }

      games[gameIndex] = updatedGame
      localStorage.setItem("cricketGames", JSON.stringify(games))
      setGame(updatedGame)
      router.push(`/game/${params.id}/summary`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Button variant="ghost" className="mr-2 p-1" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {game.teamA} vs {game.teamB}
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-slate-600 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Scoreboard</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{game.teamA}</span>
                  <span className="text-xl font-bold">
                    {game.scoreA}/{game.wicketsA} ({game.oversA}.{game.ballsA})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">{game.teamB}</span>
                  <span className="text-xl font-bold">
                    {game.scoreB}/{game.wicketsB} ({game.oversB}.{game.ballsB})
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-800">
                  <p className="font-medium">Currently Batting: {currentTeam}</p>
                  <p>
                    Extras: W-{game.currentBattingTeam === "A" ? game.extras.wideA : game.extras.wideB}, NB-
                    {game.currentBattingTeam === "A" ? game.extras.noBallA : game.extras.noBallB}
                  </p>
                </div>
              </div>
            </div>

            <div className=" p-6 rounded-lg bg-slate-600">
              <h2 className="text-xl font-bold mb-4">Match Details</h2>
              <p>
                <strong>Date:</strong> {game.date}
              </p>
              <p>
                <strong>Start Time:</strong> {game.time}
              </p>
              <p>
                <strong>Match Status:</strong> {game.status === "in-progress" ? "In Progress" : "Completed"}
              </p>
              {game.winner && (
                <p>
                  <strong>Winner:</strong> {game.winner}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-600 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Scoring Controls</h2>

              <div className=" grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-800"
                  onClick={() => updateScore(1)}
                >
                  1 Run
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-800"
                  onClick={() => updateScore(2)}
                >
                  2 Runs
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-800"
                  onClick={() => updateScore(3)}
                >
                  3 Runs
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-800"
                  onClick={() => updateScore(4)}
                >
                  4 Runs
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-800"
                  onClick={() => updateScore(6)}
                >
                  6 Runs
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-800"
                  onClick={() => setCustomRunsOpen(true)}
                >
                  More
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-800"
                  onClick={() => updateScore(1, true, "wide")}
                >
                  Wide (+1)
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-800"
                  onClick={() => updateScore(1, true, "noBall")}
                >
                  No Ball (+1)
                </Button>
                <Button variant="outline" className="border-white text-black font-bold hover:bg-gray-800" onClick={addWicket}>
                  Wicket
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-800"
                  onClick={() => updateScore(0)}
                >
                  Dot Ball
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {game.currentBattingTeam === "A" && (
                <Button className="w-full bg-white text-black font-bold hover:bg-grey-200" onClick={switchInnings}>
                  End Innings (Switch to {game.teamB})
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full border-white text-black hover:bg-gray-200"
                onClick={() => setEndGameOpen(true)}
              >
                End Game
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Runs Dialog */}
      <Dialog open={customRunsOpen} onOpenChange={setCustomRunsOpen}>
        <DialogContent className="bg-black">
          <DialogHeader>
            <DialogTitle>Enter Custom Runs</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={customRuns}
              onChange={(e) => setCustomRuns(e.target.value)}
              className="border-white "
              placeholder="Enter runs"
              min="1"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white text-white hover:"
              onClick={() => setCustomRunsOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-white hover: text-black" onClick={handleCustomRuns}>
              Add Runs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Game Dialog */}
      <Dialog open={endGameOpen} onOpenChange={setEndGameOpen}>
        <DialogContent className="bg-black">
          <DialogHeader>
            <DialogTitle>End Game</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to end the game?</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white text-white hover:"
              onClick={() => setEndGameOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-white hover: text-black"
              onClick={() => {
                endGame()
                setEndGameOpen(false)
              }}
            >
              End Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
