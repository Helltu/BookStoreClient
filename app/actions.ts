"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateGenre(oldName: string, newName: string) {
  revalidateTag("genres");
  revalidatePath(`/genre/${encodeURIComponent(oldName)}`);
  revalidatePath(`/genre/${encodeURIComponent(newName)}`);
  revalidatePath("/");
}

export async function revalidateAuthor(oldName: string, newName: string) {
  revalidateTag("authors");
  revalidatePath(`/author/${encodeURIComponent(oldName)}`);
  revalidatePath(`/author/${encodeURIComponent(newName)}`);
  revalidatePath("/");
}

export async function revalidatePublisher(oldName: string, newName: string) {
  revalidateTag("publishers");
  revalidatePath(`/publisher/${encodeURIComponent(oldName)}`);
  revalidatePath(`/publisher/${encodeURIComponent(newName)}`);
  revalidatePath("/");
}
