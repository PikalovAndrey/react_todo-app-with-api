import { useState, useCallback, FormEvent, useRef } from 'react';
import { Todo } from '../types/Todo';
import { addTodo, changeTodo, deleteTodos } from '../api/todos';
import { ErrorMessages } from '../enums/ErrorMessages';
import { USER_ID } from '../utils/USER_ID';

export const useTodos = (
  setErrorMessage: React.Dispatch<React.SetStateAction<ErrorMessages>>,
) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loadingTodosCount, setLoadingTodosCount] = useState<number[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!inputValue.trim().length) {
      setErrorMessage(ErrorMessages.EMPTY_TITLE);

      return;
    }

    const temporaryTodo: Todo = {
      id: 0,
      title: inputValue.trim(),
      userId: USER_ID,
      completed: false,
    };

    setTempTodo(temporaryTodo);
    setLoadingTodosCount(currentCount => [...currentCount, 0]);

    addTodo(temporaryTodo)
      .then((createdTodo: Todo) => {
        setTodos((currentTodos: Todo[]) => [...currentTodos, createdTodo]);
        setInputValue('');
      })
      .catch(() => {
        setErrorMessage(ErrorMessages.ADDING_ERROR);
      })
      .finally(() => {
        if (inputRef.current) {
          inputRef.current.disabled = false;
          inputRef.current.focus();
        }

        setTempTodo(null);
        setLoadingTodosCount(currentCount =>
          currentCount.filter(todoId => todoId !== 0),
        );
      });
  };

  const handleUpdateTodo = useCallback((updatedTodo: Todo) => {
    setLoadingTodosCount(current => [...current, updatedTodo.id]);

    return changeTodo(updatedTodo.id, { title: updatedTodo.title })
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo,
          ),
        );
      })
      .catch(() => {
        setErrorMessage(ErrorMessages.UPDATING_ERROR);
        throw new Error(ErrorMessages.UPDATING_ERROR);
      })
      .finally(() => {
        setLoadingTodosCount(current =>
          current.filter(todoId => todoId !== updatedTodo.id),
        );
      });
  }, []);

  const handleTodoDelete = useCallback((todoId: number) => {
    setLoadingTodosCount(current => [...current, todoId]);

    deleteTodos(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorMessage(ErrorMessages.DELETING_ERROR);
      })
      .finally(() => {
        setLoadingTodosCount(current =>
          current.filter(deletingTodoId => deletingTodoId !== todoId),
        );
      });
  }, []);

  return {
    todos,
    tempTodo,
    loadingTodosCount,
    inputRef,
    inputValue,
    setErrorMessage,
    handleSubmit,
    handleUpdateTodo,
    handleTodoDelete,
    setLoadingTodosCount,
    setTodos,
    setInputValue,
  };
};
