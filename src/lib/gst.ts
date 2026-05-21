/**
 * GST Calculation Helpers
 * India GST for Banquet / Venue Services:
 * SAC Code: 996331 (Accommodation in hotels)
 * CGST: 9% + SGST: 9% = 18% total GST
 */

export const GST_SAC_CODE = '996331';
export const CGST_RATE = 9;
export const SGST_RATE = 9;
export const TOTAL_GST_RATE = CGST_RATE + SGST_RATE;

export interface GSTBreakdown {
  baseAmountPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  totalGstPaise: number;
  totalWithGstPaise: number;
  cgstRate: number;
  sgstRate: number;
}

/**
 * Calculate GST from base amount (exclusive)
 * Base ₹1,00,000 → CGST ₹9,000 + SGST ₹9,000 → Total ₹1,18,000
 */
export function calculateGSTExclusive(baseAmountPaise: number): GSTBreakdown {
  const cgstPaise = Math.round(baseAmountPaise * (CGST_RATE / 100));
  const sgstPaise = Math.round(baseAmountPaise * (SGST_RATE / 100));
  return {
    baseAmountPaise,
    cgstPaise,
    sgstPaise,
    totalGstPaise: cgstPaise + sgstPaise,
    totalWithGstPaise: baseAmountPaise + cgstPaise + sgstPaise,
    cgstRate: CGST_RATE,
    sgstRate: SGST_RATE,
  };
}

/**
 * Extract GST from total amount (inclusive)
 * Total ₹1,18,000 → Base ₹1,00,000 + CGST ₹9,000 + SGST ₹9,000
 */
export function calculateGSTInclusive(totalAmountPaise: number): GSTBreakdown {
  const baseAmountPaise = Math.round(totalAmountPaise / (1 + TOTAL_GST_RATE / 100));
  const cgstPaise = Math.round(baseAmountPaise * (CGST_RATE / 100));
  const sgstPaise = totalAmountPaise - baseAmountPaise - cgstPaise;
  return {
    baseAmountPaise,
    cgstPaise,
    sgstPaise,
    totalGstPaise: cgstPaise + sgstPaise,
    totalWithGstPaise: totalAmountPaise,
    cgstRate: CGST_RATE,
    sgstRate: SGST_RATE,
  };
}

/**
 * Validate GSTIN format
 * Format: 2 digits state code + 10 char PAN + 1 digit entity + Z + 1 checksum
 * Example: 36AABCU9603R1ZM
 */
export function validateGSTIN(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
}
