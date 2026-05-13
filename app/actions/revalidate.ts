"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateCatalogTag(tag: "genres" | "authors" | "publishers" | "books") {
  revalidateTag(tag, "max");
  revalidatePath("/", "layout");
}
