import { RegisterPage, registerMetadata } from "@/components/olympiad/RegisterPage";

export const metadata = registerMetadata("gu");

export default async function RegisterGujaratiPage({ searchParams }: PageProps<"/olympiad/gu/register">) {
  const query = await searchParams;
  const invite = typeof query.invite === "string" ? query.invite : undefined;
  return <RegisterPage lang="gu" preview={"preview" in query} invite={invite} />;
}
