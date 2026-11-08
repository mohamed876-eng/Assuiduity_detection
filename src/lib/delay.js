export function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockRequest(handler, ms = 420) {
  await delay(ms)
  return handler()
}
