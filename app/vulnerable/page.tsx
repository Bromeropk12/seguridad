import { redirect } from "next/navigation";

export default function VulnerableHome() {
  redirect("/vulnerable/login");
}
