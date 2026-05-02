"use server";

import { revalidateTag } from "next/cache";

export async function revalidateCatalogTag(tag: "genres" | "authors" | "publishers") {
  revalidateTag(tag, "max");
}
