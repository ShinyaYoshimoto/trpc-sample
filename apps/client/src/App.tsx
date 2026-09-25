import { useState, type FormEvent } from 'react'
import './App.css'
import { trpc } from './trpc.ts'

function App() {
  const [title, setTitle] = useState('')
  const [pendingTodoIds, setPendingTodoIds] = useState<Set<string>>(() => new Set())
  const utils = trpc.useUtils()
  const todosQuery = trpc.todo.getTodos.useQuery()
  const statusMessageId = todosQuery.error ? 'todos-error' : 'todos-status'
  const canSubmit = title.trim().length > 0

  const addTodo = trpc.todo.addTodo.useMutation({
    onSuccess: async () => {
      setTitle('')
      await utils.todo.getTodos.invalidate()
    },
  })

  const toggleTodo = trpc.todo.toggleTodo.useMutation({
    onMutate: ({ id }) => {
      setPendingTodoIds((current) => new Set(current).add(id))
    },
    onSuccess: async () => {
      await utils.todo.getTodos.invalidate()
    },
    onSettled: (_data, _error, variables) => {
      setPendingTodoIds((current) => {
        const next = new Set(current)
        next.delete(variables.id)
        return next
      })
    },
  })

  const addTodoErrorMessage =
    addTodo.error?.data?.zodError?.fieldErrors.title?.[0] ?? addTodo.error?.message

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    addTodo.mutate({ title })
  }

  return (
    <main className="app-shell">
      <section className="todo-card">
        <header className="todo-header">
          <p className="eyebrow">tRPC + React + Express</p>
          <h1>Todo サンプル</h1>
          <p className="description">型安全な Todo の取得・追加・更新を確認できます。</p>
        </header>

        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            aria-label="Todo タイトル"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="新しい Todo を入力"
          />
          <button type="submit" disabled={!canSubmit || addTodo.isPending}>
            {addTodo.isPending ? '追加中...' : '追加'}
          </button>
        </form>

        {addTodoErrorMessage ? (
          <p className="error-text" role="alert">
            {addTodoErrorMessage}
          </p>
        ) : null}

        {todosQuery.isLoading ? (
          <p id="todos-status" aria-live="polite" role="status">
            読み込み中...
          </p>
        ) : null}
        {todosQuery.error ? (
          <p id="todos-error" className="error-text" role="alert">
            {todosQuery.error.message}
          </p>
        ) : null}

        <ul
          className="todo-list"
          aria-busy={todosQuery.isLoading}
          aria-describedby={todosQuery.isLoading || todosQuery.error ? statusMessageId : undefined}
        >
          {todosQuery.data?.map((todo) => (
            <li key={todo.id} className="todo-item">
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo.mutate({ id: todo.id })}
                  disabled={pendingTodoIds.has(todo.id)}
                />
                <span className={todo.completed ? 'completed' : ''}>{todo.title}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
