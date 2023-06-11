const isEmpty = (obj: Record<any, any>): obj is {} => {
  return Object.keys(obj).length === 0
}

export { isEmpty }