import { RegisterPage, registerMetadata } from "@/components/olympiad/RegisterPage";

export const metadata = registerMetadata("en");

export default async function RegisterEnglishPage({ searchParams }: PageProps<"/olympiad/register">) {
  const query = await searchParams;
  const invite = typeof query.invite === "string" ? query.invite : undefined;
  return <RegisterPage lang="en" preview={"preview" in query} invite={invite} />;
}
