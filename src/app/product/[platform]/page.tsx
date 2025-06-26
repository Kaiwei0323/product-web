import AllProductMenu from '../../components/layout/AllProduct';

export default async function PlatformProductsPage({ params }: { params: Promise<{ platform: string }> }) {
  const resolvedParams = await params;
  return <AllProductMenu platform={resolvedParams.platform} />;
}
