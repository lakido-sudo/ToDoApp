import os


class Config:
    # Настройка URI для подключения к базе данных
    # Сначала пытаемся получить значение из переменной окружения 'DATABASE_URL'
    # Если переменная не задана, используем значение по умолчанию
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              'postgresql://user:password@db/todo_db'

    # Отключаем отслеживание изменений объектов в SQLAlchemy
    # Это может помочь снизить использование памяти
    SQLALCHEMY_TRACK_MODIFICATIONS = False
