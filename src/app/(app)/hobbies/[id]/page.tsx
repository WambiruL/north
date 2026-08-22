import { redirect } from "next/navigation";

export default async function HobbyDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/hobbies?hobby=${id}`);
}
