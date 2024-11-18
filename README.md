- ### Задание 1. Разделение проекта Mesto на несколько микрофронтендов
  - [Анализ проекта (отдельный файл)](frontend/microfrontend/README.md)
  - [Уровень 1. Проектирование](#01-01-design)
  - [Уровень 2. Планирование изменений](#01-02-change-planning)
  - [Уровень 3. Запуск кода](frontend/microfrontend/code-run.md)

- ### Задание 2. Декомпозиция монолитного веб-приложения на микросервисы
  - [Бизнес-процессы, которые могут стоять за текущим решением](#01-02-business-processes)
  - [Декомпозиция предметной области](#01-02-subdomain-decomposition)
  - [Описание микросервисов](#01-02-microservises)
  - [Дополнительные модули системы](#01-02-additional-modules)
  - [Межсервисное взаимодействие - описание потоков данных между сервисами](#01-02-microservices-communication)
  - [Файл с решением](#01-02-solution)

---

### <p id="01-01-design">Уровень 1 - Проектирование</p>

1. Предварительный анализ
   - [Анализ приложения (отдельный файл)](frontend/microfrontend/README.md)
   - Цель перехода:
     - На данный момент реализация приложения в виде монолита полностью удовлетворяет всем требованиям: простое приложение с ограниченной функциональностью и редкими обновлениями связанными с поддержкой существующей функциональности   
     - Есть бизнес-задача выхода на новые рынки, что влечет за собой разработку и оперативную доставку новой функциональности, обеспечение высокой отказоустойчивости работы приложения и быстрого исправления выявленных проблем. Обеспечение единого стиля корпоративных приложений.
     - **Исходя из бизнес-задач цели перехода на микрофронтендную архитектуру**:
       - Обеспечение независимой разработки отдельных модулей приложения, их автономных сборки, тестирования и деплоя
       - Возможность частых обновлений отдельных модулей приложения
       - Обеспечение возможности масштабирования отдельных модулей без влияния на другие части системы
   - Опыт команды: команда frontend-разработчиков со стажем 5+ лет на стеке React. Планируется набор разработчиков на том же стеке с разделением на небольшие команды с непересекающимися зонами ответственности за конкретный модуль приложения 

2. Бизнес-функции, которыми будут заниматься разные команды
   - Сервис авторизации пользователя
   - Управление профилем пользователя
   - Управление списком карточек фотографий
   - Так же будет отдельная команда, занимающаяся созданием корпоративного `UI-Kit`'а 

5. Выбор метода реализации
   - **Стратегия проектирования: гибридная** - вертикальная нарезка с максимально изолированными модулями и частично шаренными библиотеками
     - вертикальная нарезка в соответствии с бизнес-функциями, определенными в п.2, что позволит разрабатывать, тестировать и обновлять модули независимо от других
     - эта стратегия обеспечивает гибкость разработки при добавлении новых функций в приложение, создавая новые микрофронты
     - одновременно получаем возможность гибко масштабировать конкретные микрофронты при возрастающих нагрузках на отдельные части системы
     - изолированность микрофронтов позволяет производить независимое развертывание каждого модуля
     - шаринг библиотек позволяет избежать дублирования кода и уменьшить размер бандлов
     - для нас не важна автономность команд в плане технологического стека - вся кодовая база у нас на одном стеке React и в планах усиливать экспертизу в этом направлении
   - **Метод интеграции микрофронтендов: Run-time**
     - нам важно что разработка ведется отдельными командами с независимыми графиками развертывания
     - у нас есть необходимость динамически обновлять отдельные модули
     - внедряемое решение должно позволять масштабировать разные части приложения независимо
   - **Метод композиции микрофронтендов: клиентская компоновка** (с возможным дальнейшим переходом на гибридный подход)
     - в нашем приложении практически весь контент интерактивный и меняется в зависимости от действий с пользователя
     - контент у нас находится за авторизацией, значит нам не важно SEO и не критично время отдачи первой страницы

4. Инструмент для создания микрофронтендов - **Webpack Module Federation**
   - этот инструмент позволяет микрофронтендам динамически обмениваться зависимостями во время выполнения
   - так же есть возможность использования разных версий библиотек без конфликтов (следует учесть что такой подход увеличит размер бандлов)
   - т.к. стратегия проектирования у нас гибридная и предполагает, в т.ч., максимально возможную изоляцию микрофронтов, высока вероятность дублирования библиотек в каждом микрофронте. Эта проблема решается за счет использования sharing'а зависимостей (надо учесть при этом усложняется контроль версий библиотек)
   - Webpack Module Federation использует `lazy` и `Suspense` для оптимизации загрузок бандлов
   - Single SPA делает упор на бесшовной интеграции на основе маршрутизации и разнообразии фреймворков, но ни одна из этих возможностей не является для нас ключевой. Стек у нас един - React. С маршрутизацией тоже нет однозначного сопоставления `route - microfrontend`. Например, на главной странице `/` у нас должны монтироваться два микрофронта `Профиль пользователя` и `Список карточек фотографий`.

5. Стратегия коммуникации микрофронтендов (управление состоянием между микрофронтендами) - **Shared Context API**
   - изначально более подходящим выглядит подход `Pub/Sub` - он позволяет компонентам публиковать события при каком-то значимом действии. У нас, например, могут быть следующие события:
     - Сервис авторизации пользователя
       - пользователь залогинился - надо передать по шине `e-mail` логина в компонент `Header.js`
       - пользователь разлогинился - данных передавать не надо
     - Управление профилем пользователя
       - пользователь отредактировал профиль - данных передавать не надо
     - Управление списком карточек фотографий
       - пользователь добавил карточку - данных передавать не надо
       - пользователь удалил карточку - данных передавать не надо
       - пользователь изменил лайк на каротчке - данных передавать не надо
     
       Получается, нам надо отправить событие при одном действии - логин пользователя и подписчик будет тоже один - `Header.js`
   - но с другой стороны, данные полученные микрофронтендом `Профиль пользователя` используются и в других модулях
     - `Список карточек фотографий` - для управления действиями с лайками фоток
     
     т.о. у нас состояние одного микрофронтенда отражается/используется в нескольких компонентах интерфейса в других микрофронтедах.
     В таком случае предпочтительнее использовать глобальное состояние - в нашем случае достаточно Context API.
   - При выборе инструмента React Context API мы завязываемся на один стек - React и нам сложно будет вносить изменения если какой-то из микрофронтендов в будущем будет использовать другой фреймворк. Но это наше решение на стратегическом уровне, поэтому используем Context API 

---

### <p id="01-02-change-planning">Уровень 2. Планирование изменений</p>

1. **Host-приложение**

```markdown
/public                     Статика для сборки host-приложения
  /src
    /components
      App.js                Корневой компонент host-приложения (Context.Provider, Router)
      Main.js               Layout для основных блоков всего приложения
      Footer.js             Компонент футера всего приложения
      Header.js             Компонент хедера всего приложения
      ProtectedRoute.js     Компонент роутера, защищенного авторизацией
    /styles
      /content              Стили для Layout всего приложения
      /page                 Стили для страницы всего приложения
      /footer               Стили для футера всего приложения
      /header               Стили для хеадера всего приложения
  index.css                 Точка входа для подключения CSS-стилей host-приложения
  index.js                  Точка входа host-приложения
package.json                Зависимости и скрипты host-приложения
webpack.config.js           Конфигурация сборщика host-приложения
```

2. **Сервис авторизации пользователя**

```markdown
/auth-microfrontend
  /src
    /components
      Login.js              Компонент формы входа в приложение Mesto
      Register.js           Компонент формы регистрации в приложении Mesto
      InfoTooltip.js        Компонент с результатами регистрации в приложении Mesto
    /styles
      /login                Стили для формы входа в приложение Mesto
      /auth-form            Стили для формы регистрации в приложении Mesto
    /utils
      auth.js               Утилиты для взаимодействия с API авторизации
  index.css                 Точка входа для подключения CSS-стилей микрофронтенда
  index.js                  Точка входа микрофронтенда
package.json                Зависимости и скрипты микрофронтенда
webpack.config.js           Конфигурация сборщика микрофронтенда
```

3. **Управление профилем пользователя**

```markdown
/user-profile-microfrontend
  /src
    /components
      Profile.js            Компонент профиля пользователя
      EditAvatarPopup.js    Компонент редактирования аватара пользователя
      EditProfilePopup.js   Компонент редактирования профиля пользователя
    /styles
      /profile              Стили для компонента профиля пользователя
    /utils
      user-profile.js       Утилиты для взаимодействия с API профиля пользователя
  index.css                 Точка входа для подключения CSS-стилей микрофронтенда
  index.js                  Точка входа микрофронтенда
package.json                Зависимости и скрипты микрофронтенда
webpack.config.js           Конфигурация сборщика микрофронтенда
```

4. **Управление списком карточек фотографий**

```markdown
/card-list-microfrontend
  /src
    /components
      Card.js               Компонент карточки фотографии
      AddPlacePopup.js      Компонент добавления карточки фотографии
      ImagePopup.js         Компонент увеличенного просмотра фотографии
    /styles
      /card                 Стили для компонента карточки фотографии
      /places               Стили для компонента добавления карточки фотографии
    /utils
      card-list.js          Утилиты для взаимодействия с API списка карточек
  index.css                 Точка входа для подключения CSS-стилей микрофронтенда
  index.js                  Точка входа микрофронтенда
package.json                Зависимости и скрипты микрофронтенда
webpack.config.js           Конфигурация сборщика микрофронтенда
```

5. **Shared context library**

```markdown
CurrentUserContext.js       Библиотека, которая будет общей для Context.Provider (host-app) и всех Context.Consumers
```

6. **Корпоративный UI-Kit**

```markdown
@icons                      Иконки в виде React компонент
@react-popupWithForm        React-компонент модального окна
@react-popup-css            Стили для React-компонент модального окна
@tokens                     Дизайн-токены: шрифты, расстояния, цвета, normalize...
```

---

### Задание 2. Декомпозиция монолитного веб-приложения на микросервисы

### <p id="01-02-business-processes">Бизнес-процессы, которые могут стоять за текущим решением</p>

Система: **Приложение по управлению Торговыми площадками**

- В системе пользователи могут размещать информацию о своих товарах и/или услугах, а так же заказы на товары/услуги других пользователей
- Заказы могут исполняться как в обычном режиме - по мере поступления и за указанную цену, так и по принципу аукциона
- Для обработки транзакций система интегрируется с внешними платежными системами
- В системе есть три роли пользователей:
  - Клиент - может управлять только своими сущностями (товар, услуга, аукцион), а так же размещать заказы на сущности других пользователей. В случае спорных вопросов может создавать заявку на апелляцию. Для решения технических вопросов - есть канал коммуникации с тех. поддержкой
  - Администратор - модерирует, валидирует, одобряет/блокирует заявки всех типов от Клиентов. В спорных ситуациях выступает арбитром по заявкам с претензиями. Имеет полный доступ ко всем заявкам и сущностям всех пользователей
  - Специалист службы поддержки пользователей - обрабатывает заявки в тех. поддержку от пользователей
- Система может формировать отчеты и статистику по проведенным операциям
- Так же есть система оповещений пользователей

---

### <p id="01-02-subdomain-decomposition">Декомпозиция предметной области</p>

Используя подход `Domain-Driven Design` были выделены следующие поддомены предметной области монолитного веб-приложения:

1. Торговая площадка
2. Профиль пользователя
3. Учетная запись
4. Нотификация
5. Услуга
6. Товар
7. Заказ
8. Заявка в тех.поддержку
9. Аукцион
10. Апелляция
11. Оплата
12. Транзакция
12. Отчеты

---

### <p id="01-02-microservises">Описание микросервисов</p>

Было решено работу с некоторыми поддоменами объединять внутри одного микросервиса. Т.о. предлагаются для реализации следующие микросервисы:

1. **Профиль пользователя + Торговая площадка**
  - управляет информацией о `Торговой площадке`, а так же `Пользователями`, которые с этой площадкой работают (для упрощения принимаем что один `Пользователь` может работать с одной `Площадкой`)
  - позволяет редактировать `Профиль пользователя`, а так же добавлять/удалять для отображения в `Профиле` `Товары` и `Услуги`
  - хранит полный набор данных о `Пользователе`
  - для отображения активных товаров/услуг в `Профиле` обращается к микросервисам `Товары`, `Услуги` за полными данными о соответствующих сущностях
  - при обновлении некоторых данных в `Профиле пользователя`, эти данные должны синхронизироваться в БД других микросервисов (например `Учетная запись`), поэтому об изменении своих объектов данных микросервис `Профиль пользователя` информирует другие микросервисы посредством очереди событий
2. **Учетная запись**
  - отвечает за регистрацию, аутентификацию и авторизацию `Пользователей`
  - хранит сокращенный набор данных о `Пользователе`
  - аналогично микросервису `Профиль пользователя`, микросервис `Учетная запись` должна проинформировать другие микросервисы посредством очереди событий для синхронизации объектов данных
3. **Нотификация**
  - формирует и отправляет `Нотификации (Сообщения)` `Пользователям`
  - хранит `config` для каждой `Нотификации` - когда, в каком виде и куда доставлять `Сообщение`
  - может доставлять `Сообщения`
    - по событию (мгновенно или отложено), при этом данные для `Сообщения` получает от других микросервисов через очередь событий
    - по графику, в этом случае для формирования `Сообщения` делает запросы в другие микросервисы за конкретными данными
4. **Услуга**
  - позволяет в зависимости от роли `Пользователя`:
    - `Клиент` - размещать/редактировать/удалять свои `Услуги` в Системе
    - `Администратор` - имеет полный доступ ко всем операциям со всеми `Услугами` Сервиса
  - есть возможность поиска `Услуг` с фильтрацией и сортировкой
  - хранит полный набор данных по всеми `Услугам` в Системе
  - при совершении вышеупомянутых операций, информирует другие микросервисы посредством очереди событий
5. **Товар**
  - аналогично микросервису **Услуга** обеспечивает работу с сущностью `Товар`
6. **Заказ**
  - аналогично микросервисам **Услуга** и **Товар**, обеспечивает работу и хранение полных данных по сущностям `Заказ`
  - т.к. сам `Заказ` состоит из `Товаров` и/или `Услуг`, он обращается к соответствующим микросервисам за дополнительными данными о соответствующей сущности
  - при совершении операций с `Заказом` информирует другие микросервисы посредством очереди сообщений
7. **Заявка в тех.поддержку**
  - `Клиент` может создать `Заявку в тех. поддержку`
  - `Специалист техподдержки` имеет возможность регистрировать и менять статус `Заявки`
  - хранит полные данные о всех `Заявках в тех. поддержку` в Системе
  - после изменения статуса `Заявки` через очередь сообщений об этом информируются остальные микросервисы
8. **Аукцион + Апелляция**
  - обеспечивает работу с `Заявками на аукцион` и `Апелляциями`
  - `Клиент` может размещать заявку на аукцион, при наступлении спорных моментов создавать `Заявку на апелляцию`
  - `Администратор` имеет права на редактирование `Аукциона`, регистрацию и изменение статуса `Заявки на апелляцию`
  - микросервис также отвечает за пересчет ставок аукциона, для чего обращается за данными к микросервисам `Товар`, `Услуга`, `Заказ`
  - хранит данные по `Заявкам на аукцион`, `Аукционам`, `Апелляциям`
  - при изменении состояния `Аукциона` / `Апелляции` информирует об этом остальные микросервисы посредство очереди сообщений
9. **Оплата + Транзакция**
  - отвечает за авторизацию, обработку, проведение, учет `Платежных операций`
  - контролирует обработку `Транзакций`, позволяет инициировать отмену `Транзакций`
  - взаимодействует с `Внешними платежными системами`
  - хранит данные обо всех `Платежных операциях` и `Транзакциях`
  - при наступлении событий с этими сущностями, информирует другие микросервисы посредством очереди сообщений
10. **Отчеты**
  - позволяет сгенерировать `Отчет` в соответствии с хранимыми в БД настройками
  - для формирования `Отчета` обращается к соответствующему микросервису за полными данными о сущности (например `Заказ`)
  - при формировании и/или отправке `Отчета` информирует другие микросервисы через очередь сообщений

---

### <p id="01-02-additional-modules">Дополнительные модули системы</p>

1. Для взаимодействия с системой пользователей с ролями `Администратор`, `Специалист поддержки`, было создано монолитное frontend-приложение `Админка`
2. Для каждого из двух монолитных frontend-приложений был реализован свой `Backend-For-Frontend`. Задачи `BFF` - взаимодействие с основными микросервисами бэкенда, агрегация и трансформация данных. Бизнес-логики в слое `BFF` нет
3. Для коммуникации микросервисов между собой в асинхронном режиме, внедрен брокер сообщений

---

### <p id="01-02-microservices-communication">Межсервисное взаимодействие - описание потоков данных между сервисами</p>

```markdown
Поток 1. Инициация платежа. [Пользователь.ID], [Заказ.ID], [Заказ.Сумма]
```

```markdown
Поток 2. Предоставить статус платежа. [Транзакция.ID], [Транзакция.Статус]
```

```markdown
Поток 3. Подтверждение платежа. [Транзакция.ID]
```

```markdown
Поток 4. Запросить статус платежа. [Транзакция.ID]
```

```markdown
Поток 5. Подтверждение отмены платежа. [Транзакция.Статус]
```

```markdown
Поток 6. Отправка `Нотификации` пользователю по email через внешний сервис рассылки. [Нотификация.ID], [Пользователь.Email], [Нотификация.Текст]
```

```markdown
Поток 7. Подтверждение отправки нотификации. [Нотификация.ID], [Нотификация.Статус]
```

```markdown
Поток 8. Отправка отчета по email через внешний сервис рассылки. [Отчет.ID], [Пользователь.Email], [Отчет.Текст] 
```

```markdown
Поток 9. Подтверждение отправки отчета. [Отчет.ID], [Отчет.Статус]
```

```markdown
Поток 10. Запрос списка активных `Услуг` пользователя для отображения в `Профиле Пользователя`. [Пользователь.ID] 
```

```markdown
Поток 11. Запрос списка активных `Товаров` пользователя для отображения в `Профиле Пользователя`. [Пользователь.ID]
```

```markdown
Поток 12. Запрос данных для составления текста `Нотификации` для отправки пользователю через внешний сервис. [Нотификация.ID], [Нотификация.Конфигурация]
```

```markdown
Поток 13. Запрос данных для составления текста `Отчета` для отправки пользователю через внешний сервис. [Отчет.ID], [Отчет.Параметры] 
```

```markdown
Поток 14. Запрос данных для пересчета ставок `Аукциона`. [Товар.ID], [Заказ.ID], [Услуга.ID] 
```

```markdown
Поток 15. Уведомление через очередь сообщений о статусе доставке `Нотификации`. [Нотификация.ID], [Нотификация.Статус]
```

```markdown
Поток 16. Уведомление через очередь сообщений о статусе доставке `Отчета`. [Отчет.ID], [Отчет.Статус]
```

```markdown
Поток 17. Уведомление через очередь сообщений об изменении статуса `Заявки в тех. поддержку`. [Заявка.ID], [Заявка.Статус] 
```

```markdown
Поток 18. Уведомление через очередь сообщений о создании новой / изменении существующей `Учетной записи` пользователя. [Пользователь.ID], [Пользователь.Статус], [Пользователь.Роль]
```

```markdown
Поток 19. Уведомление через очередь сообщений о любом изменении в `Профиле пользователя`. [Пользователь.ID], [Пользователь.Данные]
```

```markdown
Поток 20. Уведомление через очередь сообщений о создании / удалении / изменении существующей `Услуги`. [Услуга.ID], [Услуга.Данные]
```

```markdown
Поток 21. Уведомление через очередь сообщений о создании / удалении / изменении существующего `Товара`. [Товар.ID], [Товар.Данные]
```

```markdown
Поток 22. Уведомление через очередь сообщений о создании / удалении / изменении существующего `Заказа`. [Заказа.ID], [Заказа.Данные]
```

```markdown
Поток 23. Уведомление через очередь сообщений о создании / удалении / изменении существующих `Аукциона` / `Апеляции`. [Аукцион.ID], [Аукцион.Данные] / [Апелляция.ID], [Апелляция.Данные] 
```

```markdown
Поток 24. Уведомление через очередь сообщений о проведении / валидации / отмене / подтверждении / изменении статуса `Платежной операции` / `Транзакции`. [ПлатежнаяОперация.ID], [ПлатежнаяОперация.Данные] / [Транзакция.ID], [Транзакция.Данные]
```

---

### <p id="01-02-solution">Файл с решением</p>
- [arch_sprint_1_task2_solution.drawio](https://cloud.mail.ru/public/Vw7V/SLfrcar5H)