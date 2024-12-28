<div style="text-align: center;">
    <img src="https://raw.githubusercontent.com/pashkov256/media/refs/heads/main/voprosnikum/logo.png" alt="Project Banner" />
</div>

## Описание  

Это серверная часть веб-сервиса для проведения тестирования студентов в техникуме. Сервис предоставляет REST API для управления пользователями, тестами, группами, вопросами и результатами прохождения тестов.  

## Стек технологий
<div>
<img src="https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/icons/nodejs/nodejs-original.svg" title="Node.js" alt="Node.js" width="40" height="40"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/icons/mongodb/mongodb-original-wordmark.svg" title="MongoDB" alt="MongoDB" width="40" height="40"/>&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/icons/express/express-original-wordmark.svg" title="Express" alt="Express" width="40" height="40"/>&nbsp;
</div>



## Основные Функции  

- **Администратор:**  
  - Управление преподавателями (создание, удаление, обновление).  
  - Управление группами: добавление, удаление, назначение преподавателей и студентов.

- **Преподаватель:**  
  - Управление тестами: добавление, редактирование, удаление.  
  - Настройка тестов (дедлайн, время на выполнение, видимость результатов).  
  - Просмотр статистики тестов.  

- **Студент:**  
  - Доступ к тестам, назначенным на группу.  
  - Прохождение тестов с различными типами вопросов.  
  - Сохранение промежуточных и финальных результатов.  

## Основные Эндпоинты  

### Пользователи  

- *`*POST /api/users`**  
  Создание пользователя (администратор, преподаватель или студент).  

- **`GET /api/users/:id`**  
  Получение информации о пользователе.  

- **`PUT /api/users/:id`**  
  Обновление данных пользователя.  

- **`DELETE /api/users/:id`**  
  Удаление пользователя.  

---

### Группы  

- **`POST /api/groups`**  
  Создание новой группы.  

- **`GET /api/groups`**  
  Получение списка всех групп.  

- **`GET /api/groups/:id`**  
  Получение информации о группе (список студентов и преподавателей).  

- **`PUT /api/groups/:id`**  
  Обновление информации о группе.  

- **`DELETE /api/groups/:id`**  
  Удаление группы.  

---
### Тесты  

- **`POST /api/tests`**  
  Создание нового теста.  

- **`GET /api/tests`**  
  Получение списка всех тестов.  

- **`GET /api/tests/:id`**  
  Получение информации о тесте (название, вопросы, дедлайн и т.д.).  

- **`PUT /api/tests/:id`**  
  Обновление теста.  

- **`DELETE /api/tests/:id`**  
  Удаление теста.  

---

### Вопросы  

- **`POST /api/questions`**  
  Добавление вопроса в тест.  

- **`GET /api/questions/:id`**  
  Получение информации о вопросе.  

- **`PUT /api/questions/:id`**  
  Обновление вопроса.  

- **`DELETE /api/questions/:id`**  
  Удаление вопроса с пересчётом максимальных баллов теста.  

---

### Результаты Тестов  

- **`POST /api/test-results`**  
  Сохранение промежуточного или финального результата прохождения теста.  

- **`GET /api/test-results/:id`**  
  Получение результата теста для студента.  

- **`GET /api/test-results?testId=123`**  
  Получение всех результатов для конкретного теста (для преподавателей и администраторов).  

---

## Логика Оценивания  

1. **Типы вопросов:**  
   - *Одиночный выбор (single-choice):* 1 балл за правильный ответ.  
   - *Множественный выбор (multiple-choice):* 0.5 балла за каждый правильный вариант, -0.5 за каждый неправильный.  
   - *Короткий текстовый ответ (short-answer):* 1 балл за полностью совпадающий с правильным ответ.  


2**Итоговая оценка:**  
   - Оценивается в процентах от максимального балла:  
     - 80% и выше — оценка 5.  
     - 70-79% — оценка 4.  
     - 50-69% — оценка 3.  
     - Менее 50% — оценка 2.  

---

## Структура Проекта

- `/models` — Схемы Mongoose для MongoDB (тесты, вопросы, группы, результаты).
- `/routes` — Маршруты API.
- `/controllers` — Логика обработки запросов.
- `/utils` — Хелперы (авторизация, проверка ролей).
- `/utils` — Вспомогательные функции.
