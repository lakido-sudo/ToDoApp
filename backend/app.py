from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from config import Config
from datetime import datetime

# Создание экземпляра приложения Flask
app = Flask(__name__)

# Загрузка конфигурации из файла config.py
app.config.from_object(Config)

# Настройки базы данных
app.config[
    'SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@db/todo_db'  # URI для подключения к базе данных PostgreSQL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Отключение отслеживания изменений объектов

# Инициализация SQLAlchemy с приложением Flask
db = SQLAlchemy(app)


# Определение модели Task для базы данных
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Уникальный идентификатор задачи (автоинкремент)
    title = db.Column(db.String(100), nullable=False)  # Заголовок задачи (обязательное поле)
    description = db.Column(db.Text, nullable=True)  # Описание задачи (необязательное поле)
    created_at = db.Column(db.DateTime,
                           default=datetime.utcnow)  # Дата и время создания задачи (по умолчанию текущее время)


# Маршрут для главной страницы приложения
@app.route('/')
def index():
    tasks = Task.query.all()  # Получение всех задач из базы данных
    for task in tasks:
        task.created_at = task.created_at.strftime('%Y-%m-%d %H:%M:%S')  # Форматируем дату для удобства отображения
    return render_template('index.html', tasks=tasks)  # Отображаем шаблон index.html с переданными задачами


# Маршрут для получения списка задач (GET запрос)
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()  # Получение всех задач из базы данных
    return jsonify([{'id': task.id, 'title': task.title, 'description': task.description} for task in
                    tasks])  # Возвращаем задачи в формате JSON


# Маршрут для создания новой задачи (POST запрос)
@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()  # Получаем данные из запроса в формате JSON
    new_task = Task(title=data['title'], description=data.get('description'))  # Создаем новую задачу
    db.session.add(new_task)  # Добавляем новую задачу в сессию базы данных
    db.session.commit()  # Сохраняем изменения в базе данных
    return jsonify({'id': new_task.id}), 201  # Возвращаем ID новой задачи и статус 201 (создано)


# Маршрут для обновления существующей задачи (PUT запрос)
@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    task = Task.query.get_or_404(id)  # Получаем задачу по ID или возвращаем ошибку 404, если не найдена
    data = request.get_json()  # Получаем данные из запроса в формате JSON
    task.title = data['title']  # Обновляем заголовок задачи
    task.description = data.get('description')  # Обновляем описание задачи (если есть)
    db.session.commit()  # Сохраняем изменения в базе данных
    return jsonify({'message': 'Задача обновлена'})  # Возвращаем сообщение об успешном обновлении


# Маршрут для удаления существующей задачи (DELETE запрос)
@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get_or_404(id)  # Получаем задачу по ID или возвращаем ошибку 404, если не найдена
    db.session.delete(task)  # Удаляем задачу из сессии базы данных
    db.session.commit()  # Сохраняем изменения в базе данных
    return jsonify({'message': 'Задача удалена'})  # Возвращаем сообщение об успешном удалении


if __name__ == '__main__':
    # Создание всех таблиц при первом запуске приложения
    with app.app_context():
        db.create_all()  # Создает все таблицы в базе данных на основе моделей

    app.run(host='0.0.0.0', port=5000)  # Запускаем приложение на всех интерфейсах на порту 5000
