/* =========================================================
   RETRO ARCADE DROP - MATH & DECOY GENERATOR
   Smart Arithmetic, Decoy Logic & Special Number Modes
========================================================= */

class MathGenerator {
  constructor() {
    this.primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    this.composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50];
  }

  // Helper to ensure safe, unique, and non-validating decoys
  getSafeDecoy(answer, candidates, existingAnswers, validator = null) {
    const validCandidates = candidates.filter(n => 
      Number.isInteger(n) &&
      n > 0 && 
      n !== answer && 
      !existingAnswers.includes(n) && 
      (!validator || !validator(n))
    );

    if (validCandidates.length > 0) {
      return validCandidates[Math.floor(Math.random() * validCandidates.length)];
    }

    // Dynamic search for safe unique fallback
    for (let delta = 1; delta <= 60; delta++) {
      const up = answer + delta;
      if (up > 0 && up !== answer && !existingAnswers.includes(up) && (!validator || !validator(up))) {
        return up;
      }
      const down = answer - delta;
      if (down > 0 && down !== answer && !existingAnswers.includes(down) && (!validator || !validator(down))) {
        return down;
      }
    }
    return answer + 4;
  }

  // Generates a problem object: { prompt, answer, getDecoy: (existing) => number }
  generate(category = 'all', stage = 1) {
    let mode = category;
    if (category === 'all') {
      const modes = ['add', 'sub', 'mult', 'div', 'mult', 'addsub', 'special'];
      mode = modes[Math.floor(Math.random() * modes.length)];
    }

    switch (mode) {
      case 'mult':
        return this.generateMultiplication(stage);
      case 'addsub':
        return Math.random() > 0.5 ? this.generateAddition(stage) : this.generateSubtraction(stage);
      case 'add':
        return this.generateAddition(stage);
      case 'sub':
        return this.generateSubtraction(stage);
      case 'div':
        return this.generateDivision(stage);
      case 'special':
        return this.generateSpecial(stage);
      default:
        return this.generateMultiplication(stage);
    }
  }

  // --- Multiplication ---
  generateMultiplication(stage) {
    const maxA = Math.min(12, 4 + stage);
    const maxB = Math.min(12, 3 + stage);
    const a = 2 + Math.floor(Math.random() * (maxA - 1));
    const b = 2 + Math.floor(Math.random() * (maxB - 1));
    const answer = a * b;

    return {
      prompt: `${a} × ${b} = ?`,
      answer: answer,
      type: 'exact',
      getDecoy: (existingAnswers) => {
        const candidates = [
          (a + 1) * b,
          (a - 1) * b,
          a * (b + 1),
          a * (b - 1),
          answer + 2,
          answer - 2,
          answer + 10,
          answer - 10,
          this.transposeDigits(answer),
          (a + 1) * (b + 1)
        ];
        return this.getSafeDecoy(answer, candidates, existingAnswers);
      }
    };
  }

  // --- Addition ---
  generateAddition(stage) {
    const range = Math.min(55, 10 + stage * 6);
    const a = Math.floor(Math.random() * range) + 3;
    const b = Math.floor(Math.random() * range) + 2;
    const answer = a + b;

    return {
      prompt: `${a} + ${b} = ?`,
      answer: answer,
      type: 'exact',
      getDecoy: (existingAnswers) => {
        const candidates = [
          answer + 1,
          answer - 1,
          answer + 2,
          answer - 2,
          answer + 10,
          answer - 10,
          answer + 9, // Off by 1 in carry
          answer - 9,
          this.transposeDigits(answer)
        ];
        return this.getSafeDecoy(answer, candidates, existingAnswers);
      }
    };
  }

  // --- Subtraction ---
  generateSubtraction(stage) {
    const range = Math.min(65, 12 + stage * 7);
    const b = Math.floor(Math.random() * range) + 2;
    const answer = Math.floor(Math.random() * range) + 3;
    const a = b + answer; // Guarantees positive clean answer

    return {
      prompt: `${a} - ${b} = ?`,
      answer: answer,
      type: 'exact',
      getDecoy: (existingAnswers) => {
        const candidates = [
          answer + 1,
          answer - 1,
          answer + 2,
          answer - 2,
          answer + 10,
          answer - 10,
          this.transposeDigits(answer),
          answer + b
        ];
        return this.getSafeDecoy(answer, candidates, existingAnswers);
      }
    };
  }

  // --- Division ---
  generateDivision(stage) {
    const divisorMax = Math.min(12, 4 + stage);
    const divisor = 2 + Math.floor(Math.random() * (divisorMax - 1));
    const quotientMax = Math.min(12, 4 + stage);
    const answer = 2 + Math.floor(Math.random() * (quotientMax - 1));
    const dividend = divisor * answer;

    return {
      prompt: `${dividend} ÷ ${divisor} = ?`,
      answer: answer,
      type: 'exact',
      getDecoy: (existingAnswers) => {
        const candidates = [
          answer + 1,
          answer - 1,
          answer + 2,
          answer - 2,
          divisor,
          answer + 3
        ];
        return this.getSafeDecoy(answer, candidates, existingAnswers);
      }
    };
  }

  // --- Number Ninja Special (Primes, Multiples, Even/Odd) ---
  generateSpecial(stage) {
    const specials = ['prime', 'multiple_3', 'multiple_5', 'even', 'odd'];
    const chosen = specials[Math.floor(Math.random() * specials.length)];

    if (chosen === 'prime') {
      const primeAnswers = this.primes.slice(0, 16);
      const answer = primeAnswers[Math.floor(Math.random() * primeAnswers.length)];
      const validator = (n) => this.primes.includes(n);
      return {
        prompt: `CATCH A PRIME NUMBER!`,
        answer: answer,
        type: 'rule',
        validator: validator,
        getDecoy: (existing) => {
          return this.getSafeDecoy(answer, this.composites, existing, validator);
        }
      };
    } else if (chosen === 'multiple_3') {
      const mults = [9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 42, 45, 48, 54];
      const answer = mults[Math.floor(Math.random() * mults.length)];
      const validator = (n) => n % 3 === 0;
      const nonMults = [10, 11, 13, 14, 16, 17, 19, 20, 22, 23, 25, 26, 28, 31, 32, 34, 38, 40, 44];
      return {
        prompt: `CATCH MULTIPLE OF 3!`,
        answer: answer,
        type: 'rule',
        validator: validator,
        getDecoy: (existing) => {
          return this.getSafeDecoy(answer, nonMults, existing, validator);
        }
      };
    } else if (chosen === 'multiple_5') {
      const mults = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 75];
      const answer = mults[Math.floor(Math.random() * mults.length)];
      const validator = (n) => n % 5 === 0;
      const nonMults = [14, 16, 21, 24, 26, 29, 31, 34, 36, 42, 44, 49, 51, 54, 56, 62, 64, 71];
      return {
        prompt: `CATCH MULTIPLE OF 5!`,
        answer: answer,
        type: 'rule',
        validator: validator,
        getDecoy: (existing) => {
          return this.getSafeDecoy(answer, nonMults, existing, validator);
        }
      };
    } else if (chosen === 'even') {
      const evens = [14, 18, 22, 26, 32, 38, 44, 48, 52, 56, 64, 72];
      const answer = evens[Math.floor(Math.random() * evens.length)];
      const validator = (n) => n % 2 === 0;
      const odds = [15, 19, 23, 27, 33, 37, 45, 49, 53, 57, 65, 71];
      return {
        prompt: `CATCH AN EVEN NUMBER!`,
        answer: answer,
        type: 'rule',
        validator: validator,
        getDecoy: (existing) => {
          return this.getSafeDecoy(answer, odds, existing, validator);
        }
      };
    } else {
      // Odd
      const odds = [13, 17, 21, 27, 31, 35, 43, 49, 53, 57, 63, 77];
      const answer = odds[Math.floor(Math.random() * odds.length)];
      const validator = (n) => n % 2 !== 0;
      const evens = [14, 18, 22, 28, 32, 36, 44, 50, 54, 58, 64, 76];
      return {
        prompt: `CATCH AN ODD NUMBER!`,
        answer: answer,
        type: 'rule',
        validator: validator,
        getDecoy: (existing) => {
          return this.getSafeDecoy(answer, evens, existing, validator);
        }
      };
    }
  }

  // Utility: reverse digits for deceptive distractors (e.g. 56 -> 65)
  transposeDigits(n) {
    if (n < 10) return n + 5;
    const str = n.toString();
    if (str.length === 2 && str[0] !== str[1]) {
      const reversed = parseInt(str.split('').reverse().join(''), 10);
      if (reversed > 0) return reversed;
    }
    return n + 3;
  }
}

window.mathGenerator = new MathGenerator();
