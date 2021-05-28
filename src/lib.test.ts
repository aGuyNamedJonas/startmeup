import { parseArgs } from "./lib"

describe('parseArgs', () => {
  test('Returns null when no arguments are provided', () => {
    expect(parseArgs(['npx', 'startmeup'])).toBeNull()
  })

  test('Returns null when no arguments are provided', () => {
    expect(parseArgs(['npx', 'startmeup'])).toBeNull()
  })
})