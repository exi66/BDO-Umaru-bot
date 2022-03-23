const { declOfNum } = require("../functions.js");

module.exports = {
    name: "en",
    translate: {
        GENERAL: {
            CANCEL: "Команда отменена пользователем",
            TIMEOUT: "Команда отменена по таймауту!",
            ERROR: "Непредвиденная ошибка!",
            DONT_HAVE_PERMISSIONS: "у вас нет прав использовать эту команду!",
            DONT_HAVE_ARGS: "отсутвуют аргументы!",
        },
        BOT: {
            ACTIVITY: (guilds, prefix) => { return `${guilds} ${declOfNum(guilds, ["сервер", "сервера", "серверов"])} • ${prefix}help` },
        },
        SCRAPER : {},
        CONFIG : {
            DESCRIPTION: "Управляет конфигурацией сервера",
            DONT_HAVE_CONFIG: "конфигурация сервера отсутствует, использование не возможно!",
            EMBED: {
                TITLE: "Server config",
            },
            INCORRECT_CONFIG_ARGS: "Неизвестный параметр! Изменять можно только `category`, `queue`, `coupons`, `coupons_role`",
            EDIT_AND_SAVE: "Изменено и сохранено!",
        },
        COUPONES : {
            EMBED: {
                TITLE: "Купоны",
            },
            DESCRIPTION: "Выдает доступные купоны с Орбиты Игр",
            DONT_HAVE_COUPONS: "Нет доступных купонов!",
        },
        QUEUE : {
            DESCRIPTION: "Выдает текущую очередь регистрации на аукционе",
            DONT_HAVE_ITEMS: "Очередь аукциона пуста!",
            EMBED: {
                TITLE: "Очередь аукциона",
                FIELDS: {
                    LVL: "lvl",
                    NAME: "Название",
                    TIME: "Время размещения",
                },
            },
        },
        START : {
            DESCRIPTION: "Быстрое начало работы",
            TEMPLATE: {
                COUPONS_NAME: "Купоны",
                COUPONS_REASON: "Роль для упоминания при публикации купонов",
                V_BS_NAME: "V: БС",
                V_BS_REASON: "Роль для упоминания при продаже V бс",
                V_MANOS_NAME: "V: Бижутерия Маноса",
                V_MANOS_REASON: "Роль для упоминания при продаже V бижутерии маноса",
                IV_DEBORIKA_NAME: "IV: Бижутерия Деборики",
                IV_DEBORIKA_REASON: "Роль для упоминания при продаже IV бижутерии деборики",
                V_DEBORIKA_NAME: "V: Бижутерия Деборики",
                V_DEBORIKA_REASON: "Роль для упоминания при продаже V бижутерии деборики", 
            },
            CATEGORY_NAME: "bdo umaru",
            COUPONS_CHANNEL_NAME: "coupons",
            QUEUE_CHANNEL_NAME: "queue",
            CREATE_AUTO: (prefix) => { return `Автоматическая настройка создаст категорию, два канала в ней и базовые роли для отслеживания купонов и редких предметов. В случае отказа будет создан шаблон конфига без каких-либо параметров, который можно настроить командой \`${prefix}config\`. Хотите ли вы произвести автоматическую настройку? (Да/Нет)` },
            SUCCESS: (prefix) => { return `Конфигурация сервера успешно создана! Для редактирования отслеживаемых товаров аукциона используйте команду \`${prefix}track\`, для изменения конфигурации сервера \`${prefix}config\`` },
        },
        TRACK : {
            DESCRIPTION: "Управляет отслеживанием аукциона",
            TRACKED_EMPTY: "Cписок отслеживаемых товаров пуст!",
            DONT_HAVE_CONFIG: "конфигурация сервера отсутствует, использование не возможно!",
            EMBED: {
                TITLE: "Отслеживаемые товары",
                FIELDS: {
                    ROLE: "Роль",
                    ID: "id",
                    LVL: "lvl",
                },
            },
            REMOVED: {
                QUESTION_1: "Упомяните роль, которую хотите перестать отслеживать или укажите ее id",
                ERROR_1: "Не удалось распознать роль!",
                QUESTION_2: (count) => { return `Найдено ${count} ${declOfNum(count, ["зависимость", "зависимости", "зависимостей"])}. Какую удалить? (1-${count})` },
                QUESTION_2_EMBED: {
                    TITLE: "Найденные соответствия",
                    FIELDS: {
                        NUM: "№",
                        ID: "id",
                        LVL: "lvl",
                    },
                },
                ERROR_2: "Не удалось распознать индекс!",
                ERROR_3: "Не удалось найти такую зависимость!",
                SUCCESS: "Удалено!",
            },
            ADD: {
                LIMITE_ERROR: "Достигнут лимит на 5 отслеживаемых групп товаров для сервера! Удалите какую-нибудь группу для создания новой.",
                QUESTION_1: "Какую роль упоминать? Укажите `id` или упомяните ее через `@role-name`",
                ERROR_1: "Не удалось распознать роль!",
                QUESTION_2: "Перечислите id необходимых для отслеживания предметов",
                QUESTION_3: "Укажите уровень усиления (общий для всей группы ранее указанных предметов)",
                ERROR_3: "Не удалось распознать число!",
                QUESTION_4: "Все верно? Да(Y)\/Нет(N)",
                SUCCESS: "Создано!",
            },
        },
        UMARU : {
            NOT_FOUND: "ничего не найдено :(",
        },
        ABOUT : {
            EMBED: {
                TITLE: "О проекте",
                DESCRIPTION: "Простой бот на Discord.js с фукнциями для проекта [BDO](https://www.ru.playblackdesert.com/main/index)\n[Github](https://github.com/exi66/BDO-Umaru-bot)\n[Telegram](https://t.me/exi666)\nDiscord: `Exi#5604`",    
            },
        },
        GUILD : {
            DESCRIPTION: "Возвращает id сервера",
        },
        HELP : {
            DESCRIPTION: "Информация о командах",
            INFO_EMPTY: (name) => { return `Нет информации о команде **${name}**` },
            EMBED: {
                INFO_NAME: (name) => { return `**Команда**: ${name}` },
                INFO_ALIASES: (aliases) => { return `\n**Алиасы**: ${aliases}` },
                INFO_DESCRIPTION: (desc) => { return `\n**Описание**: ${desc}` },
                INFO_USAGE: (usage) => { return `\n**Использование**: ${usage}` },
                FOOTER: "Синтаксис: <> = необходимо, [] = опционально",
            },
        },
        PING : {
            PING: "Задержка",
        },
        WHOIS : {
            DESCRIPTION: "Возвращает информацию о пользователе",
            EMBED: {
                FIELDS: {
                    INFO: "Информация:",
                    INFO_DESCRIPTION: (name, joined, roles) => { return `**> Никнейм:** ${name}
                    **> Дата подключения:** ${joined}
                    **> Роли:** ${roles}` },
                    USER: "Пользователь:",
                    USER_DESCRIPTION: (id, name, tag, created) => { return `**> ID:** ${id}
                    **> Имя:** ${name}
                    **> Тэг:** ${tag}
                    **> Регистрация:** ${created}` },
                    GAME: "В игре:",
                    GAME_DESCRIPTION: (game) => { return `**> Название:** ${game}` },  
                }
            },
        },
        EXEC : {
            DESCRIPTION: "Выполняет код",
        },
        SAY : {
            DESCRIPTION: "Бот говорит за вас",
        },
    }
}
