import AllProductMenu from '../components/layout/AllProduct';
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inventec NA | Products",
  description: "Explore our comprehensive range of industrial solutions and edge computing products",
}

export default function AllProductsPage() {
  return <AllProductMenu platform="" />;
}
