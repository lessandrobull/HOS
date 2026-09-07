// Importações do Módulo 1
import { textoIntro1 } from './texto-intro1.js';
import { textoAnalise1 } from './texto-analise1.js';
import { quizModulo1 } from './texto-quiz1.js';

// Futuramente, você adicionará as importações dos Módulos 2 ao 7 aqui.
// Exemplo: import { textoIntro2 } from './texto-intro2.js';

// Objeto central exportado para o main.js
export const dadosModulos = {
  1: {
    intro: textoIntro1,
    analise: textoAnalise1,
    quiz: quizModulo1
  }
  // 2: {
  //   intro: textoIntro2,
  //   analise: textoAnalise2,
  //   quiz: quizModulo2
  // }
};