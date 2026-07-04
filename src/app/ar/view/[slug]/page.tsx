import PublicARViewClient from "./PublicARViewClient";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicARViewPage({ params }: Props) {
  const { slug } = await params;
  return <PublicARViewClient slug={slug} />;
}
