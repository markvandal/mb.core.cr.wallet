

export const createCurrentDate = () => {
  const now = new Date()
  const date = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0,0,0)

  return {
    seconds: Math.round(date / 1000),
    nanos: 0,
  }
}