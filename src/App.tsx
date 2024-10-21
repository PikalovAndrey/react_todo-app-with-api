import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { changeTodo, deleteTodos } from './api/todos';
import { FilterOptions, ErrorMessages } from './enums/';
import { filteredTodos, loadTodos } from './utils/';
import { Header, Footer, TodoList, Errors } from './components/';
import { useTodos } from './hooks/useTodos';

export const App: React.FC = () => {
  const [filter, setFilter] = useState<FilterOptions>(FilterOptions.ALL);
  const [errorMessage, setErrorMessage] = useState(ErrorMessages.NO_ERRORS);

  const {
    todos,
    tempTodo,
    loadingTodosCount,
    inputRef,
    inputValue,
    handleSubmit,
    handleUpdateTodo,
    handleTodoDelete,
    setLoadingTodosCount,
    setTodos,
    setInputValue,
  } = useTodos(setErrorMessage);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleCompletedTodosDeleted = useCallback(() => {
    const todosForDeleting = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    setLoadingTodosCount(current => [...current, ...todosForDeleting]);

    Promise.all(
      todosForDeleting.map(id =>
        deleteTodos(id)
          .then(() => {
            setTodos(currentTodos =>
              currentTodos.filter(todo => todo.id !== id),
            );
          })
          .catch(() => {
            setErrorMessage(ErrorMessages.DELETING_ERROR);
          })
          .finally(() => {
            setLoadingTodosCount(current =>
              current.filter(deletingTodoId => deletingTodoId !== id),
            );
          }),
      ),
    );
  }, [todos, setLoadingTodosCount]);

  const handleTodosToggle = useCallback(() => {
    const hasIncompleteTodos = todos.some(todo => !todo.completed);
    const todosForToggling = todos
      .filter(todo => todo.completed !== hasIncompleteTodos)
      .map(todo => todo.id);

    setLoadingTodosCount(current => [...current, ...todosForToggling]);

    Promise.all(
      todosForToggling.map(id =>
        changeTodo(id, { completed: hasIncompleteTodos })
          .then(() => {
            setTodos(currentTodos =>
              currentTodos.map(todo =>
                todo.id === id
                  ? { ...todo, completed: hasIncompleteTodos }
                  : todo,
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
  }, [setLoadingTodosCount, todos]);

  const handleTodoToggle = useCallback(
    (todoId: number, currentCompletedStatus: boolean) => {
      setLoadingTodosCount(current => [...current, todoId]);
      changeTodo(todoId, { completed: !currentCompletedStatus })
        .then(() => {
          setTodos(currentTodos =>
            currentTodos.map(todo =>
              todo.id === todoId
                ? { ...todo, completed: !todo.completed }
                : todo,
            ),
          );
        })
        .catch(() => {
          setErrorMessage(ErrorMessages.UPDATING_ERROR);
        })
        .finally(() => {
          setLoadingTodosCount(current =>
            current.filter(deletingTodoId => todoId !== deletingTodoId),
          );
        });
    },
    [setLoadingTodosCount, setTodos],
  );

  const todosAfterFiltering = useMemo(
    () => filteredTodos(todos, filter),
    [todos, filter],
  );

  const completedTodos = useMemo(
    () => todos.filter(todo => todo.completed),
    [todos],
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [todos, inputRef]);

  useEffect(() => {
    loadTodos(setTodos, setErrorMessage);
  }, [setTodos]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(ErrorMessages.NO_ERRORS);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          value={inputValue}
          todos={todos}
          completedTodos={completedTodos}
          inputRef={inputRef}
          loadingTodos={loadingTodosCount}
          onTodosToggle={handleTodosToggle}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
        />

        <TodoList
          tempTodo={tempTodo}
          todosAfterFiltering={todosAfterFiltering}
          loadingTodos={loadingTodosCount}
          inputRef={inputRef}
          onTodoDelete={handleTodoDelete}
          onTodoToggle={handleTodoToggle}
          onUpdateTodo={handleUpdateTodo}
        />

        {!!todos.length && (
          <Footer
            todos={todos}
            completedTodos={completedTodos}
            filter={filter}
            setFilter={setFilter}
            onCompletedTodosDeleted={handleCompletedTodosDeleted}
          />
        )}
      </div>

      <Errors errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
    </div>
  );
};
