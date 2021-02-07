

export const createCurrentDate = () => {
  const now = new Date()
  const date = Date.UTC(
    now.getFullYear(), 
    now.getMonth(), 
    now.getDate(), 
    now.getHours(), 
    now.getMinutes(),
    now.getSeconds(),
    0,
  )

  return {
    seconds: Math.round(date / 1000),
    nanos: 0,
  }
}