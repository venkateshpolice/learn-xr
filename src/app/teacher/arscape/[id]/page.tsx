import ARScapeEditor from "@/components/arscape/ARScapeEditor";

type Props = { params: Promise<{ id: string }> };

export default async function ARScapeEditorPage({ params }: Props) {
  const { id } = await params;
  return <ARScapeEditor sceneId={id} />;
}
