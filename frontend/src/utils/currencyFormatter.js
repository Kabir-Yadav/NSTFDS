/**
 * Formats a number into Indian currency format (Lakhs, Crores)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatIndianCurrency = (amount) => {
    if (amount === 0) return '₹0';

    const absAmount = Math.abs(amount);

    // For amounts less than 1 lakh (100,000)
    if (absAmount < 100000) {
        return `₹${amount.toLocaleString('en-IN')}`;
    }

    // For amounts in lakhs (1,00,000 to 99,99,999)
    if (absAmount < 10000000) {
        const lakhs = (amount / 100000).toFixed(1);
        return `₹${lakhs}L`;
    }

    // For amounts in crores (1,00,00,000 and above)
    const crores = (amount / 10000000).toFixed(1);
    return `₹${crores}Cr`;
};

/**
 * Gets the full formatted number for tooltip display
 * @param {number} amount - The amount to format
 * @returns {string} Full formatted currency string
 */
export const getFullCurrencyFormat = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
};
