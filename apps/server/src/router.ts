import { TRPCError, initTRPC } from '@trpc/server'
import { ZodError, z } from 'zod'

const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
            : null,
      },
    }
  },
})

const todoInputSchema = z.object({
  title: z.string().trim().min(1, 'タイトルは必須です'),
})

const toggleTodoInputSchema = z.object({
  id: z.string().uuid(),
})

export type Todo = {
  id: string
  title: string
  completed: boolean
}

const todos: Todo[] = []

export const appRouter = t.router({
  todo: t.router({
    getTodos: t.procedure.query(() => todos),
    addTodo: t.procedure.input(todoInputSchema).mutation(({ input }) => {
      const todo: Todo = {
        id: crypto.randomUUID(),
        title: input.title,
        completed: false,
      }

      todos.unshift(todo)

      return todo
    }),
    toggleTodo: t.procedure.input(toggleTodoInputSchema).mutation(({ input }) => {
      const todo = todos.find((item) => item.id === input.id)

      if (!todo) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Todo が見つかりません',
        })
      }

      todo.completed = !todo.completed

      return todo
    }),
  }),
})

export type AppRouter = typeof appRouter
