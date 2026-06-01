import { gifts } from '../data/gifts.js'

/**
 * Calcula a pontuação por dom a partir do array de respostas.
 * @param {number[]} answers - Array de 135 valores (0–3), indexado pelo id original da questão
 * @returns {Object} scores - { giftId: score } onde score é 0–15
 */
export function calculateScores(answers) {
  const scores = {}

  gifts.forEach((gift) => {
    // As 5 questões de cada dom têm índices: giftId, giftId+27, giftId+54, giftId+81, giftId+108
    let total = 0
    for (let block = 0; block < 5; block++) {
      const questionId = gift.id + block * 27
      total += answers[questionId] ?? 0
    }
    scores[gift.id] = total
  })

  return scores
}

/**
 * Retorna os dons ordenados do maior para o menor score.
 * @param {Object} scores - { giftId: score }
 * @returns {Array} giftsRanked - [{ gift, score }, ...]
 */
export function rankGifts(scores) {
  return gifts
    .map((gift) => ({ gift, score: scores[gift.id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
}

/**
 * Formata os scores para o prompt da IA.
 * @param {Object} scores
 * @returns {string}
 */
export function formatScoresForAI(scores) {
  return rankGifts(scores)
    .map(({ gift, score }) => `${gift.name}: ${score}/15`)
    .join('\n')
}
