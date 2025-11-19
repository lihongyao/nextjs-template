import { apiFetch } from "@/api/apiConfig";

export default async function Page() {
  apiFetch("/products").then((res) => {
    console.log(res);
  });
  return <div></div>;
}
