/* eslint-disable @typescript-eslint/indent */
import { ErrorMessages } from '../enums';
import { Todo } from '../types/Todo';

export const updateTodos = (
  todoIds: number[],
  newStatus: boolean | null,
  setLoadingTodosCount: React.Dispatch<React.SetStateAction<number[]>>,
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<ErrorMessages>>,
  operation: (id: number, changes?: Partial<Todo>) => Promise<void>,
  deleteOperation?: (id: number) => Promise<void>,
): Promise<void> => {
  setLoadingTodosCount(current => [...current, ...todoIds]);

  const promises = todoIds.map(id => {
    const action =
      newStatus !== null
        ? operation(id, { completed: newStatus })
        : deleteOperation
          ? deleteOperation(id)
          : operation(id);

    return action
      .then(() => {
        setTodos(currentTodos =>
          newStatus !== null
            ? currentTodos.map(todo =>
                todo.id === id ? { ...todo, completed: newStatus } : todo,
              )
            : currentTodos.filter(todo => todo.id !== id),
        );
      })
      .catch(() => {
        setErrorMessage(
          newStatus !== null
            ? ErrorMessages.UPDATING_ERROR
            : ErrorMessages.DELETING_ERROR,
        );
      })
      .finally(() => {
        setLoadingTodosCount(current =>
          current.filter(loadingId => loadingId !== id),
        );
      });
  });

  return Promise.all(promises).then(() => {});
};
