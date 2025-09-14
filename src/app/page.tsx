import { Navigation } from '@/components/Navigation'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to RecipeGram
        </h1>
        <p className="text-center text-gray-600">
          Share your favorite recipes with the world!
        </p>
      </div>
    </main>
  )
}
