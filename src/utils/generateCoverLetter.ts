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
Уважаемый работодатель,

Я хотел бы выразить свой большой интерес к возможности присоединиться к вашей команде в качестве ${jobRole}. Ваша компания является примером инновационного мышления и стремится к достижению выдающихся результатов, и я полностью разделяю вашу страсть и энтузиазм.

Территориально нахожусь в городе Сосновый Бор, но готов к переезду в ${city}

С наилучшими пожеланиями,

${applicantName}
`
}
