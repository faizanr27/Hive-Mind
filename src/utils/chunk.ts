export function chunkText(text: string, maxBytes = 9500): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of text.split(" ")) {
      const wordSize = Buffer.byteLength(word, "utf8");
      const currentSize = Buffer.byteLength(currentChunk, "utf8");

      if (currentSize + wordSize + 1 > maxBytes) {
          chunks.push(currentChunk.trim());
          currentChunk = word;
      } else {
          currentChunk += (currentChunk ? " " : "") + word;
      }
  }

  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}
