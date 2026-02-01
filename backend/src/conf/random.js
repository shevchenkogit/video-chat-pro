/**
 * Утиліта для роботи з рядками
 */
const stringHelper = {
  /**
   * Генерує випадковий рядок заданої довжини.
   * Використовує набір символів за замовчуванням (Alphanumeric).
   */
  generateRandomString: (length = 10, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
      let result = '';
      const charactersLength = characters.length;
      
      for (let i = 0; i < length; i++) {
          // Використовуємо bitwise NOT (~~) замість Math.floor для швидкості (мікро-оптимізація)
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      
      return result;
  },

  /**
   * Порада для резюме: 
   * Для критичних ID краще використовувати вбудований модуль crypto
   */
  generateSecureToken: () => {
      const crypto = require('crypto');
      return crypto.randomBytes(32).toString('hex');
  }
};

module.exports = stringHelper;