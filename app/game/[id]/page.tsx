"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Undo2 } from "lucide-react" // Import Undo2 icon
// Remove useToast import
// import { useToast } from "@/components/ui/use-toast"

// Define a type for the game state to ensure consistency
interface GameState {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  wicketsA: number;
  oversA: number;
  ballsA: number;
  extras: {
    wideA: number;
    noBallA: number;
    wideB: number;
    noBallB: number;
  };
  scoreB: number;
  wicketsB: number;
  oversB: number;
  ballsB: number;
  currentBattingTeam: "A" | "B";
  status: "in-progress" | "completed";
  date: string;
  time: string;
  endTime?: string;
  winner?: string;
}


export default function GamePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [game, setGame] = useState<GameState | null>(null) // Use GameState type
  const [loading, setLoading] = useState(true)
  const [customRunsOpen, setCustomRunsOpen] = useState(false)
  const [customRuns, setCustomRuns] = useState("")
  const [endGameOpen, setEndGameOpen] = useState(false)

  // State for undo history
  const [history, setHistory] = useState<GameState[]>([])
  const [isUndoing, setIsUndoing] = useState(false) // Flag to prevent saving history during undo

  // Remove toast initialization
  // const { toast } = useToast()

  useEffect(() => {
    const games: GameState[] = JSON.parse(localStorage.getItem("cricketGames") || "[]") // Use GameState type
    const currentGame = games.find((g: GameState) => g.id === id) // Use GameState type

    if (currentGame) {
      setGame(currentGame)
    } else {
      router.push("/")
    }

    setLoading(false)
  }, [id, router])

  // Function to save the current state to history
  const saveHistory = (currentState: GameState) => {
    if (isUndoing) return // Don't save history if we are currently undoing

    // Limit history size (e.g., last 20 actions)
    const historyLimit = 20;
    setHistory(prevHistory => {
        const newHistory = [...prevHistory, currentState];
        if (newHistory.length > historyLimit) {
            return newHistory.slice(newHistory.length - historyLimit); // Keep only the last `historyLimit` states
        }
        return newHistory;
    });
  }

  // Function to handle undo
  const handleUndo = () => {
      if (history.length === 0) return; // Nothing to undo

      setIsUndoing(true); // Set flag to prevent saving history
      const previousState = history[history.length - 1]; // Get the last state from history

      // Update game state
      setGame(previousState);

      // Update history state
      setHistory(prevHistory => prevHistory.slice(0, -1)); // Remove the last state

      // Update localStorage
      const games: GameState[] = JSON.parse(localStorage.getItem("cricketGames") || "[]");
      const gameIndex = games.findIndex((g: GameState) => g.id === id);
      if (gameIndex !== -1) {
          games[gameIndex] = previousState;
          localStorage.setItem("cricketGames", JSON.stringify(games));
      }

      // Optional: Add a temporary message or toast (if you decide to add a different feedback system)
      console.log("Undo action successful"); // Console log for confirmation

      setIsUndoing(false); // Reset flag
  }


  if (loading || !game) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading match data...</p>
      </div>
    )
  }

  // --- Calculations ---
  const currentTeamName = game.currentBattingTeam === "A" ? game.teamA : game.teamB;
  const opposingTeamName = game.currentBattingTeam === "A" ? game.teamB : game.teamA;

  const currentScore = game.currentBattingTeam === "A" ? game.scoreA : game.scoreB;
  const currentWickets = game.currentBattingTeam === "A" ? game.wicketsA : game.wicketsB;
  const currentOvers = game.currentBattingTeam === "A" ? game.oversA : game.oversB;
  const currentBalls = game.currentBattingTeam === "A" ? game.ballsA : game.ballsB;

  const opposingScore = game.currentBattingTeam === "A" ? game.scoreB : game.scoreA;
  const totalMatchOvers = 20; // Assuming 20 overs per innings, adjust if needed

  const runsNeeded = game.currentBattingTeam === 'B' ? Math.max(0, game.scoreA + 1 - game.scoreB) : 0;
  const totalBallsInMatch = totalMatchOvers * 6;
  const ballsBowledByCurrentTeam = (game.currentBattingTeam === 'A' ? game.oversA * 6 + game.ballsA : game.oversB * 6 + game.ballsB);
  const ballsRemaining = game.currentBattingTeam === 'B' ? Math.max(0, totalBallsInMatch - ballsBowledByCurrentTeam) : 0;


  const crrA = game.oversA * 6 + game.ballsA > 0 ? (game.scoreA / (game.oversA + game.ballsA / 6)).toFixed(2) : '0.00';
  const crrB = game.oversB * 6 + game.ballsB > 0 ? (game.scoreB / (game.oversB + game.ballsB / 6)).toFixed(2) : '0.00';

  const rrr = game.currentBattingTeam === 'B' && runsNeeded > 0 && ballsRemaining > 0 ? (runsNeeded / (ballsRemaining / 6)).toFixed(2) : 'N/A';
  // --- End calculations ---

  const updateScore = (runs: number, isExtra = false, extraType = "") => {
    // Save current state to history before modifying
    saveHistory(game);

    const games: GameState[] = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    const gameIndex = games.findIndex((g: GameState) => g.id === id)

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
      } else { // Team B batting
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
    checkAutoEndGame(updatedGame) // Pass the updated game state
  }

  const addWicket = () => {
    // Save current state to history before modifying
    saveHistory(game);

    const games: GameState[] = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    const gameIndex = games.findIndex((g: GameState) => g.id === id)

    if (gameIndex !== -1) {
      const updatedGame = { ...games[gameIndex] }

      if (updatedGame.currentBattingTeam === "A") {
        updatedGame.wicketsA += 1
        updatedGame.ballsA += 1

        if (updatedGame.ballsA === 6) {
          updatedGame.oversA += 1
          updatedGame.ballsA = 0
        }

        if (updatedGame.wicketsA === 10) {
           updatedGame.currentBattingTeam = "B"
        }
      } else { // Team B batting
        updatedGame.wicketsB += 1
        updatedGame.ballsB += 1

        if (updatedGame.ballsB === 6) {
          updatedGame.oversB += 1
          updatedGame.ballsB = 0
        }

        if (updatedGame.wicketsB === 10 || updatedGame.scoreB > updatedGame.scoreA) {
          endGame(updatedGame)
          return // Exit after calling endGame
        }
      }

      games[gameIndex] = updatedGame
      localStorage.setItem("cricketGames", JSON.stringify(games))
      setGame(updatedGame)
    }
  }

  const switchInnings = () => {
    // Decide if switching innings should be undoable.
    // For simplicity, we won't add it to undo history with the same button.
    // If you want it undoable, you'd save history here and handle reverting the team switch in handleUndo.
    const games: GameState[] = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    const gameIndex = games.findIndex((g: GameState) => g.id === id)

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
    if (!isNaN(runs) && runs >= 0) {
      updateScore(runs) // updateScore saves history internally
      setCustomRunsOpen(false)
      setCustomRuns("")
    } else {
        console.error("Invalid input for custom runs:", customRuns); // Log error instead of toast
    }
  }

  const endGame = (gameData: GameState) => { // Use GameState type
    // Decided not to make endGame undoable via the scoring undo button
    const games: GameState[] = JSON.parse(localStorage.getItem("cricketGames") || "[]")
    const gameIndex = games.findIndex((g: GameState) => g.id === gameData.id)

    if (gameIndex !== -1) {
      const updatedGame = { ...gameData }
      updatedGame.status = "completed"
      updatedGame.endTime = new Date().toISOString()

      const runsA = updatedGame.scoreA
      const runsB = updatedGame.scoreB

      if (runsA > runsB) {
        updatedGame.winner = updatedGame.teamA
      } else if (runsB > runsA) {
        updatedGame.winner = updatedGame.teamB
      } else {
        updatedGame.winner = "Tie"
      }

      games[gameIndex] = updatedGame
      localStorage.setItem("cricketGames", JSON.stringify(games))
      setGame(updatedGame) // Update state before navigating
      router.push(`/game/${id}/summary`)
    }
  }

  const checkAutoEndGame = (currentGame: GameState) => { // Accept game state as parameter
    if (currentGame && currentGame.currentBattingTeam === 'B') {
      if (currentGame.scoreB > currentGame.scoreA) {
        console.log("Team B has surpassed Team A's score - automatically ending game")
        // Delay the actual endGame call slightly if needed, but passing updatedGame should be fine
        endGame(currentGame);
        return true;
      }
    }
    return false;
  }


  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between"> {/* Added justify-between */}
          <div className="flex items-center">
            <Button variant="ghost" className="mr-2 p-1" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">
              {game.teamA} vs {game.teamB}
            </h1>
          </div>

           {/* Undo Button */}
           <Button
                variant="outline"
                size="icon" // Make button size consistent with icon
                className="bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleUndo}
                disabled={history.length === 0 || isUndoing} // Disable if no history or currently undoing
            >
                <Undo2 className="h-5 w-5" />
                <span className="sr-only">Undo last action</span> {/* Accessibility */}
            </Button>
            {/* End Undo Button */}

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

                {/* Commentary Phrases */}
                {game.currentBattingTeam === 'B' && runsNeeded > 0 && ballsRemaining > 0 && (
                  <p className="text-lg font-semibold text-yellow-300">
                    {runsNeeded} run{runsNeeded !== 1 ? 's' : ''} needed in {ballsRemaining} ball{ballsRemaining !== 1 ? 's' : ''}
                  </p>
                )}
                 {game.currentBattingTeam === 'B' && runsNeeded === 0 && game.scoreB > game.scoreA && (
                     <p className="text-lg font-semibold text-green-400">
                       {game.teamB} wins!
                     </p>
                 )}
                 {game.currentBattingTeam === 'B' && game.wicketsB === 10 && game.scoreB <= game.scoreA && (
                     <p className="text-lg font-semibold text-red-400">
                        {game.teamA} wins!
                     </p>
                 )}


                <div className="pt-2 border-t border-gray-200">
                  <p className="font-medium">Currently Batting: {currentTeamName}</p>
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
                 {/* End Commentary Phrases */}
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
                  onClick={() => updateScore(0, false, "dot")} // Mark as dot ball, not extra
                >
                  Dot Ball
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {game.currentBattingTeam === "A" && (
                <Button className="w-full bg-white text-black font-bold hover:bg-gray-200" onClick={switchInnings}>
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
            <DialogTitle className="text-white">Enter Custom Runs</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={customRuns}
              onChange={(e) => setCustomRuns(e.target.value)}
              className="border-white bg-gray-700 text-white"
              placeholder="Enter runs"
              min="0"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-gray-700"
              onClick={() => {
                 setCustomRunsOpen(false);
                 setCustomRuns(""); // Clear input on cancel
              }}
            >
              Cancel
            </Button>
            <Button className="bg-white text-black font-bold hover:bg-gray-200" onClick={handleCustomRuns}>
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
              className="bg-white text-black font-bold hover:bg-gray-200"
              onClick={() => {
                endGame(game); // Pass current game state
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