import { getCourtTypes, createCourtType, deleteCourtType } from "@/lib/actions/courts";
import CourtsClient from "./CourtsClient";

export const dynamic = "force-dynamic";

export default async function CourtsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const courts = await getCourtTypes(id);
  return <CourtsClient tenantId={id} initialCourts={courts} />;
}
