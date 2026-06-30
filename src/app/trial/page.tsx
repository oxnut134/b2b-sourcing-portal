import { redirect } from "next/navigation";
import TrialAutoLogin from "./auto-login";

export default async function TrialPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;
  if (token !== "b2b-demo-2026") {
    redirect("/login");
  }
  return <TrialAutoLogin />;
}
