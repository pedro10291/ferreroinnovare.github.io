export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  reply?: string;
}

export const googleReviews: Review[] = [
  {
    id: '1',
    author: 'Jayne',
    rating: 5,
    text: "Quero deixar aqui minha avaliação super positiva! O lugar é lindo e muito bem organizado. O trabalho de micropigmentação ficou impecável, feito com muito cuidado, técnica e profissionalismo. Além disso, o atendimento foi maravilhoso, com muita atenção em cada detalhe.",
    reply: "Agradecemos muito pelo seu feedback! Ficamos felizes em saber que sua experiência foi positiva. Trabalhamos com dedicação para oferecer sempre o melhor atendimento. Será um prazer recebê-lo(a) novamente!"
  },
  {
    id: '2',
    author: 'Vanessa Olimpio',
    rating: 5,
    text: "Super indico, fui muito bem atendida.\nO ambiente é confortável e limpo.\nA profissional é super atenciosa.\nParabéns a todos da equipe 👏🏻👏🏻"
  },
  {
    id: '3',
    author: 'Shirlei Eloy',
    rating: 5,
    text: "Atendimento impecável fiz retirada de verrugas de pescoço com patricia e a sobrancelha com a Luana tudo ficou perfeito atendimento nota mil desde recepção até a Patrícia e vou fazer mais procedimentos ainda to só começando",
    reply: "Agradecemos pelo feedback 😊"
  },
  {
    id: '4',
    author: 'Nathalia Rossato',
    rating: 5,
    text: "Nossa maravilhosas, não tenho o que reclamar das meninas, principalmente da Luana um amor de pessoa. São super dedicadas e os serviços oferecidos é perfeito. Vale super a pena conhecer o espaço e os serviços. 😍😍🥰"
  },
  {
    id: '5',
    author: 'Andy Cardoso',
    rating: 5,
    text: "A Patrícia é uma profissional super atenciosa, e tem a competência para avaliar e dar a pele o tratamento necessário. Em minha primeira consulta ela receitou os produtos que minha pele mais necessitava e na primeira semana de uso já vi resultados.\nServiço acima das minhas expectativas, só tenho a agradecer pela ajuda e recomendo demais os serviços.",
    reply: "Gratidão 🙏🏻"
  },
  {
    id: '6',
    author: 'Kemily Matinha',
    rating: 5,
    text: "Experiência incrível, ambiente aconchegante, atendimento excelente",
    reply: "Agradecemos o seu feedback 😊"
  }
];

export const googleReviewsStats = {
  average: 4.9,
  total: 121,
  link: "https://www.google.com/search?q=ferrer+innovare&oq=ferrer+innovare+&gs_lcrp=EgRlZGdlKgYIABBFGDkyBggAEEUYOTIICAEQABgWGB4yCggCEAAYChgWGB4yCAgDEAAYFhgeMgoIBBAAGIAEGKIEMgcIBRAAGO8FMgcIBhAAGO8FMgYIBxBFGD0yBggIEEUYPTIICAkQ6QcY_FXSAQg2NTAzajBqN6gCAbACAQ&sourceid=chrome&source=chrome.ob&ie=UTF-8#"
};
