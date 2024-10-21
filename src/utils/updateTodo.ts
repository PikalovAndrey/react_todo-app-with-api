import { ErrorMessages } from '../enums';
import { Todo } from '../types/Todo';

export const updateTodos = (
  todoIds: number[],
  newStatud: boolean,
  setLoadingTodosCount: React.Dispatch<React.SetStateAction<number[]>>,
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<ErrorMessages>>,
  changeTodo: (id: number, changes: Partial<Todo>) => Promise<void>,
) => {
  setLoadingTodosCount(current => [...current, ...todoIds]);

  return Promise.all(
    todoIds.map(id =>
      changeTodo(id, { completed: newStatud })
        .then(() => {
          setTodos(currentTodos =>
            currentTodos.map(todo =>
              todo.id === id ? { ...todo, completed: newStatud } : todo,
            ),
          );
        })
        .catch(() => {
          setErrorMessage(ErrorMessages.UPDATING_ERROR);
        })
        .finally(() => {
          setLoadingTodosCount(current =>
            current.filter(loadingId => loadingId !== id),
          );
        }),
    ),
  );
};
