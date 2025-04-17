import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">Howzat</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="text-2xl font-bold">Howzat - The Cricket Scoreboard</h2>
            <p className="mt-2 text-gray-400">Track your cricket matches with ease</p>
          </div>

          <div className="">
            <Link href="/new-game">
              <Button className="mb-3 w-full font-bold bg-white hover:bg-gray-200 text-black">Start New Game</Button>
            </Link>

            <Link href="/history">
              <Button variant="outline" className="w-full font-bold border-white text-black hover:bg-gray-200">
                View Game History
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Cricket Scoreboard
        </div>
      </footer>
    </div>
  )
}
