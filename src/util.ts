export function mapToObject<T>(map: Map<string, T>) {
  return Array.from(map).reduce(
    (acc, [key, value]) => {
      acc[key] = value
      return acc
    },
    {} as Record<string, T>,
  )
}

export function mapToObjectWithNumberKeys<T>(map: Map<string, T>) {
  return Array.from(map).reduce(
    (acc, [key, value]) => {
      acc[parseInt(key)] = value
      return acc
    },
    {} as Record<number, T>,
  )
}

export function objectToMap<T>(obj: Record<string, T>) {
  return new Map(Object.entries(obj))
}

export function objectWithNumberKeysToMap<T>(obj: Record<number, T>) {
  return new Map(
    Object.entries(obj).map(([key, value]) => [key.toString(), value]),
  )
}
