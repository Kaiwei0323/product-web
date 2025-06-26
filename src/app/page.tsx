import Link from "next/link"
import Header from "./components/layout/Header"
import Hero from "./components/layout/Hero"
import HomeProduct from "./components/layout/HomeProduct"
import { Session } from "inspector/promises"

export default function Home() {
  return (
    <div className="space-y-0">
      <Hero />
      <HomeProduct />
    </div>
  )
}