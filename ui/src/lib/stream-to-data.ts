export interface Element {
  file: {
    type: "Buffer";
    data: number[];
  };
  elementSelector: string;
}

export async function streamToData(
  body: ReadableStream<Uint8Array>,
  cb: (element: Element) => void
) {
  const data = [];

  const reader = body.pipeThrough(new TextDecoderStream()).getReader();

  let support = "";
  while (reader) {
    const stream = await reader.read();
    if (stream.done) break;

    const { value } = stream;

    const completePatternMatch = /\n/g;

    if (!completePatternMatch.test(value)) {
      support += value;
      continue;
    }

    const chunks = (support + value).replace("\n", "");
    if (!chunks) continue;

    const json = JSON.parse(chunks);
    cb(json);
    data.push(json);

    support = "";
  }

  return data;
}
