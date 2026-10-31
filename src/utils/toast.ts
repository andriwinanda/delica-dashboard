import { reactive } from 'vue'

export const errorToasts = reactive<{ id: number; message: string }[]>([])
let nextId = 0
const timers = new Map<number, ReturnType<typeof setTimeout>>()

export const dismissToast = (id: number) => {
  const index = errorToasts.findIndex((toast) => toast.id === id)
  if (index !== -1) errorToasts.splice(index, 1)
  clearTimeout(timers.get(id))
  timers.delete(id)
}

export const showErrorToast = (message: string) => {
  if (errorToasts.some((toast) => toast.message === message)) return
  if (errorToasts.length >= 4) dismissToast(errorToasts[0].id)
  const id = ++nextId
  errorToasts.push({ id, message })
  timers.set(id, setTimeout(() => dismissToast(id), 6000))
}
