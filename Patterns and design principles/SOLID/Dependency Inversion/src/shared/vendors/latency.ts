/** Every fake vendor call "goes over the network". Tests that hit vendors pay this. */
export const VENDOR_LATENCY_MS = 100;

export function networkRoundTrip(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, VENDOR_LATENCY_MS));
}
