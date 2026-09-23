import { redirect } from "next/navigation";

export default function AdminLoginRedirectPage() {
  redirect("/login?redirect=/admin");
}
