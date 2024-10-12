document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;

    fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
    }).then(response => response.json())
      .then(data => {
          // Создаем новый элемент задачи
          const taskList = document.getElementById('task-list');
          const newTaskDiv = createTaskElement(data.id, title, description);
          taskList.appendChild(newTaskDiv); // Добавляем новую задачу в конец списка

          // Очищаем форму
          document.getElementById('task-title').value = '';
          document.getElementById('task-description').value = '';
      });
});

function createTaskElement(id, title, description) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';

    taskDiv.innerHTML = `
        <div class="task-content">
            <div class="task-header">
                <span class="task-number">${document.getElementById('task-list').children.length + 1}.</span>
                <h3 class="task-title">${title}</h3>
                <input type="text" class="edit-title" value="${title}" style="display:none;" /> <!-- Поле ввода заголовка -->
            </div>
            <p class="task-description">${description}</p>
            <textarea class="edit-description" style="display:none;">${description}</textarea>
            <div class="task-footer">
                <span class="task-date">Добавлено только что</span>
            </div>
        </div>
        <div class="button-container">
            <button class="edit-button" data-id="${id}">Редактировать</button>
            <button class="save-button" style="display:none;" data-id="${id}">Сохранить</button>
            <button class="delete-button" data-id="${id}">Удалить</button>
        </div>`;

    // Добавляем обработчики событий
    taskDiv.querySelector('.delete-button').addEventListener('click', () => deleteTask(id, taskDiv));
    taskDiv.querySelector('.edit-button').addEventListener('click', () => toggleEditMode(taskDiv, true));
    taskDiv.querySelector('.save-button').addEventListener('click', () => saveTask(id, taskDiv));

    return taskDiv;
}

function toggleEditMode(taskContent, isEditing) {
    const titleElement = taskContent.querySelector('.task-title');
    const descriptionElement = taskContent.querySelector('.task-description');
    const titleInput = taskContent.querySelector('.edit-title');
    const descriptionTextarea = taskContent.querySelector('.edit-description');

    if (isEditing) {
        // Скрываем элементы заголовка и описания
        titleElement.style.display = 'none';
        descriptionElement.style.display = 'none';

        // Показываем поля ввода
        titleInput.style.display = 'inline-block'; // Измените на inline-block
        descriptionTextarea.style.display = 'block';

        // Скрываем кнопку "Редактировать" и показываем кнопку "Сохранить"
        taskContent.querySelector('.edit-button').style.display = 'none';
        taskContent.querySelector('.save-button').style.display = 'inline-block';
    } else {
        // Отображаем элементы заголовка и описания
        titleElement.style.display = 'block';
        descriptionElement.style.display = 'block';

        // Скрываем поля ввода
        titleInput.style.display = 'none';
        descriptionTextarea.style.display = 'none';

        // Возвращаем кнопку "Редактировать" и скрываем кнопку "Сохранить"
        taskContent.querySelector('.edit-button').style.display = 'inline-block';
        taskContent.querySelector('.save-button').style.display = 'none';
    }
}

// Обработчик события для кнопок "Удалить"
document.getElementById('task-list').addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-button')) {
        const taskId = e.target.getAttribute('data-id');

        fetch(`/tasks/${taskId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                const taskElement = e.target.closest('.task');
                taskElement.remove();
            } else {
                console.error('Ошибка при удалении задачи');
            }
        })
        .catch(error => console.error('Ошибка:', error));
    }

    // Обработчик события для кнопки "Редактировать"
    if (e.target.classList.contains('edit-button')) {
        const taskContent = e.target.closest('.task'); // Находим родительский элемент задачи
        toggleEditMode(taskContent, true);
    }

    // Обработчик события для кнопки "Сохранить"
    if (e.target.classList.contains('save-button')) {
        const taskId = e.target.getAttribute('data-id');
        const taskContent = e.target.closest('.task');

        const titleInput = taskContent.querySelector('.edit-title');
        const descriptionTextarea = taskContent.querySelector('.edit-description');

        const updatedTitle = titleInput.value;
        const updatedDescription = descriptionTextarea.value;

        fetch(`/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: updatedTitle, description: updatedDescription })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Задача обновлена') {
                toggleEditMode(taskContent, false);

                const titleElement = taskContent.querySelector('.task-title');
                const descriptionElement = taskContent.querySelector('.task-description');

                titleElement.innerText = updatedTitle;
                descriptionElement.innerText = updatedDescription;
            } else {
                console.error('Ошибка при обновлении задачи');
            }
        })
        .catch(error => console.error('Ошибка:', error));
    }
});