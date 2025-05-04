"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation" // Import useParams
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"

// Remove params from props as we'll use useParams hook
export default function GamePage() {
  const router = useRouter()
  // Use the useParams hook to get route parameters in a client component
  const params = useParams();
  const id = params.id as string; // Access the id from the hook result

  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [customRunsOpen, setCustomRunsOpen] = useState(false)
  const [customRuns, setCustomRuns] = useState("")
  const [endGameOpen, setEndGameOpen] = useState(false)

  useEffect(() => {
    // Load game data from localStorage
    const games = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    // Use the id derived from useParams
    const currentGame = games.find((g: any) => g.id === id)

    if (currentGame) {
      setGame(currentGame)
    } else {
      router.push("/")
    }

    setLoading(false)
  }, [id, router]) // id (from useParams) is the dependency

  if (loading || !game) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading match data...</p>
      </div>
    )
  }
  
  // --- Add these calculations ---

  const currentTeam = game.currentBattingTeam === "A" ? game.teamA : game.teamB
  const currentScore = game.currentBattingTeam === "A" ? game.scoreA : game.scoreB
  const currentWickets = game.currentBattingTeam === "A" ? game.wicketsA : game.wicketsB
  const currentOvers = game.currentBattingTeam === "A" ? game.oversA : game.oversA // Corrected: Should be oversA for team A
  const currentBalls = game.currentBattingTeam === "A" ? game.ballsA : game.ballsA // Corrected: Should be ballsA for team A

  const opposingScore = game.currentBattingTeam === "A" ? game.scoreB : game.scoreA
  const totalMatchOvers = 20; // Assuming 20 overs per innings, adjust if needed

  // Calculations
  const runsNeeded = game.currentBattingTeam === 'B' && game.scoreB <= game.scoreA ? game.scoreA + 1 - game.scoreB : 0;
  const totalBallsInMatch = totalMatchOvers * 6;
  const ballsBowledByCurrentTeam = (game.currentBattingTeam === 'A' ? game.oversA * 6 + game.ballsA : game.oversB * 6 + game.ballsB);
  const ballsRemaining = game.currentBattingTeam === 'B' ? totalBallsInMatch - ballsBowledByCurrentTeam : 0;


  const crrA = game.oversA * 6 + game.ballsA > 0 ? (game.scoreA / (game.oversA + game.ballsA / 6)).toFixed(2) : '0.00';
  const crrB = game.oversB * 6 + game.ballsB > 0 ? (game.scoreB / (game.oversB + game.ballsB / 6)).toFixed(2) : '0.00';

  const rrr = game.currentBattingTeam === 'B' && runsNeeded > 0 && ballsRemaining > 0 ? (runsNeeded / (ballsRemaining / 6)).toFixed(2) : 'N/A';

  // --- End calculations ---

  const updateScore = (runs: number, isExtra = false, extraType = "") => {
    const games = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    // Use the id derived from useParams
    const gameIndex = games.findIndex((g: any) => g.id === id)

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
    checkAutoEndGame()
  }

  const addWicket = () => {
    const games = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    // Use the id derived from useParams
    const gameIndex = games.findIndex((g: any) => g.id === id)

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
    // Use the id derived from useParams
    const gameIndex = games.findIndex((g: any) => g.id === id)

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
     // Use gameData.id for finding the game in localStorage, which is the id needed
    const gameIndex = games.findIndex((g: any) => g.id === gameData.id)

    if (gameIndex !== -1) {
      const updatedGame = { ...gameData }
      updatedGame.status = "completed"
      updatedGame.endTime = new Date().toISOString()

      // Simply compare the scores directly - they're already numbers
      const runsA = updatedGame.scoreA
      const runsB = updatedGame.scoreB

      // Determine winner based on runs
      if (runsA > runsB) {
        updatedGame.winner = updatedGame.teamA
      } else if (runsB > runsA) {
        updatedGame.winner = updatedGame.teamB
      } else {
        updatedGame.winner = "Tie"
      }

      games[gameIndex] = updatedGame
      localStorage.setItem("cricketGames", JSON.stringify(games))
      setGame(updatedGame)
      // Use the id derived from useParams for navigation
      router.push(`/game/${id}/summary`)
    }
  }

  // Function to check if game should auto-end when second team surpasses first team's score
  const checkAutoEndGame = () => {
    // Only check if team B is batting (second innings)
    if (game && game.currentBattingTeam === 'B') {
      // Direct comparison of score numbers
      if (game.scoreB > game.scoreA) {
        console.log("Team B has surpassed Team A's score - automatically ending game")
        endGame()
        return true
      }
    }
    return false
  }


  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-200 py-4">
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

                {/* --- Add Commentary Phrases Here --- */}
                {game.currentBattingTeam === 'B' && runsNeeded > 0 && ballsRemaining > 0 && (
                  <p className="text-lg font-semibold text-yellow-300">
                    {runsNeeded} runs needed in {ballsRemaining} balls
                  </p>
                )}


                <div className="pt-2 border-t border-gray-200">
                  <p className="font-medium">Currently Batting: {currentTeam}</p>
                  <p>
                    Extras: W-{game.currentBattingTeam === "A" ? game.extras.wideA : game.extras.wideB}, NB-
                    {game.currentBattingTeam === "A" ? game.extras.noBallA : game.extras.noBallB}
                  </p>
                   {/* Display CRR for both teams */}
                   <p>CRR ({game.teamA}): {crrA}</p>
                   <p>CRR ({game.teamB}): {crrB}</p>

                  {/* Display RRR only if Team B is batting and applicable */}
                  {game.currentBattingTeam === 'B' && rrr !== 'N/A' && (
                      <p>RRR: {rrr}</p>
                  )}
                </div>
                 {/* --- End Commentary Phrases --- */}
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
                  className="border-white text-black font-bold hover:bg-gray-200"
                  onClick={() => updateScore(1)}
                >
                  1 Run
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-200"
                  onClick={() => updateScore(2)}
                >
                  2 Runs
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-200"
                  onClick={() => updateScore(3)}
                >
                  3 Runs
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-200"
                  onClick={() => updateScore(4)}
                >
                  4 Runs
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-200"
                  onClick={() => updateScore(6)}
                >
                  6 Runs
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-200"
                  onClick={() => setCustomRunsOpen(true)}
                >
                  More
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-200"
                  onClick={() => updateScore(1, true, "wide")}
                >
                  Wide (+1)
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-200"
                  onClick={() => updateScore(1, true, "noBall")}
                >
                  No Ball (+1)
                </Button>
                <Button variant="outline" className="border-white text-black font-bold hover:bg-gray-200" onClick={addWicket}>
                  Wicket
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black font-bold hover:bg-gray-200"
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
            <DialogTitle className="text-white">End Game</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-white">
            <p>Are you sure you want to end the game?</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white text-black hover:bg-gray-200"
              onClick={() => setEndGameOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-white hover: text-black font-bold hover:bg-gray-200"
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