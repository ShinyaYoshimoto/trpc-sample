import { useState, type FormEvent } from 'react'
import './App.css'
import { trpc } from './trpc.ts'

function App() {
  const [title, setTitle] = useState('')
  const [pendingTodoId, setPendingTodoId] = useState<string | null>(null)
  const utils = trpc.useUtils()
  const todosQuery = trpc.todo.getTodos.useQuery()

  const addTodo = trpc.todo.addTodo.useMutation({
    onSuccess: async () => {
      setTitle('')
      await utils.todo.getTodos.invalidate()
    },
  })

  const toggleTodo = trpc.todo.toggleTodo.useMutation({
    onMutate: ({ id }) => {
      setPendingTodoId(id)
    },
    onSuccess: async () => {
      await utils.todo.getTodos.invalidate()
    },
    onSettled: () => {
      setPendingTodoId(null)
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await addTodo.mutateAsync({ title })
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
          <button type="submit" disabled={addTodo.isPending}>
            {addTodo.isPending ? '追加中...' : '追加'}
          </button>
        </form>

        {addTodo.error ? (
          <p className="error-text" role="alert">
            {addTodo.error.message}
          </p>
        ) : null}

        {todosQuery.isLoading ? (
          <p aria-live="polite" role="status">
            読み込み中...
          </p>
        ) : null}
        {todosQuery.error ? (
          <p className="error-text" role="alert">
            {todosQuery.error.message}
          </p>
        ) : null}

        <ul className="todo-list">
          {todosQuery.data?.map((todo) => (
            <li key={todo.id} className="todo-item">
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo.mutate({ id: todo.id })}
                  disabled={pendingTodoId === todo.id}
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
