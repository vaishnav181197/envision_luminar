import { redirect } from "next/navigation";

import { getStudentSession } from "@/lib/auth/student-session";

import { VoteEntryForm } from "./vote-entry-form";

export default async function VoteEntryPage() {
  const student = await getStudentSession();
  if (student) {
    redirect("/gallery");
  }

  return <VoteEntryForm />;
}
