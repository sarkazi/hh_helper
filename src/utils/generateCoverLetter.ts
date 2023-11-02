interface IGenerateCoverLetterProps {
  city: string
  jobRole: string
  applicantName: string
}

export const generateCoverLetter = (
  props: IGenerateCoverLetterProps
): string => {
  const { city, jobRole, applicantName } = props

  return `
Здравствуйте.

Имею полтора года опыта на фронте (React) и год на бэке (Node.js).

viralbear.media - проект, над которым трудился последние 6 месяцев. Разрабатывал систему личных кабинетов для авторов, админа и работников. В проекте присутствует очень тесная интеграция с Trello REST API / Trello webhook, google API, facebook API. Клиентская часть написана с использованием Material UI и Mantine. Серверная на Node.js + Express. Так же для передачи некоторых данных на клиент используется Web Socket.

Помимо всего прочего владею такими инструментами, как Docker, Nginx и Jenkins. Был опыт настройки несложных пайплайнов. Выкладкой проекта в прод и настройкой окружения занимался сам. Неплохо владею linux.

Также Был опыт разработки телеграм ботов и парсеров (этот отклик и сопроводительное оставлены с помощью бота https://github.com/sarkazi/hh_helper)

Очень заинтересовала Ваша вакансия и используемый Вами стэк технологий. Буду рад ответить на любые вопросы и выполнить тестовое задание.

Территориально нахожусь в г. Сосновый Бор. Готов к переезду в ${city}

С уважением, Морозов Николай

https://github.com/sarkazi
+79500069797
@kolunyja
`
}
