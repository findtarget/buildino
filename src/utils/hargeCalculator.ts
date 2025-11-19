// src/utils/chargeCalculator.ts
interface Unit {
  id: number;
  number: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL';
  area: number;
  floor: number;
  isOccupied: boolean;
}

interface ChargeSettings {
  maintenanceRatePerSqm: number;
  elevatorBaseRate: number;
  janitorRate: number;
  securityRate: number;
  commercialMultiplier: number;
  dueDayOfMonth: number;
  latePaymentPenaltyRate: number; // درصد جریمه دیرکرد
  maxPenaltyAmount: number;
  discountForEarlyPayment: number; // درصد تخفیف پرداخت زودهنگام
}

export interface ChargeBreakdown {
  unitId: number;
  baseCharges: {
    maintenance: number;
    elevator: number;
    janitor: number;
    security: number;
    subtotal: number;
  };
  utilities: {
    water: number;
    gas: number;
    electricity: number;
    subtotal: number;
  };
  adjustments: {
    penalty: number;
    discount: number;
    subtotal: number;
  };
  total: number;
  dueDate: Date;
  description: string[];
}

export class ChargeCalculator {
  private settings: ChargeSettings;
  
  constructor(settings: ChargeSettings) {
    this.settings = settings;
  }

  /**
   * محاسبه شارژ پایه برای یک واحد
   */
  calculateBaseCharges(unit: Unit): ChargeBreakdown['baseCharges'] {
    const multiplier = unit.type === 'COMMERCIAL' ? this.settings.commercialMultiplier : 1;
    
    const maintenance = Math.round(unit.area * this.settings.maintenanceRatePerSqm * multiplier);
    const elevator = unit.floor > 0 
      ? Math.round(this.settings.elevatorBaseRate * unit.floor * multiplier)
      : 0;
    const janitor = Math.round(this.settings.janitorRate * multiplier);
    const security = Math.round(this.settings.securityRate * multiplier);
    
    return {
      maintenance,
      elevator,
      janitor,
      security,
      subtotal: maintenance + elevator + janitor + security
    };
  }

  /**
   * محاسبه جریمه دیرکرد
   */
  calculateLatePenalty(baseAmount: number, daysPastDue: number): number {
    if (daysPastDue <= 0) return 0;
    
    const penaltyAmount = Math.round(
      baseAmount * (this.settings.latePaymentPenaltyRate / 100) * 
      Math.ceil(daysPastDue / 30) // هر ماه
    );
    
    return Math.min(penaltyAmount, this.settings.maxPenaltyAmount);
  }

  /**
   * محاسبه تخفیف پرداخت زودهنگام
   */
  calculateEarlyPaymentDiscount(baseAmount: number, daysEarly: number): number {
    if (daysEarly <= 0) return 0;
    
    return Math.round(baseAmount * (this.settings.discountForEarlyPayment / 100));
  }

  /**
   * محاسبه کامل شارژ برای یک واحد
   */
  calculateUnitCharge(
    unit: Unit,
    month: string,
    utilities: { water?: number; gas?: number; electricity?: number } = {},
    adjustments: { penalty?: number; discount?: number } = {}
  ): ChargeBreakdown {
    const baseCharges = this.calculateBaseCharges(unit);
    
    const utilitiesData = {
      water: utilities.water || 0,
      gas: utilities.gas || 0,
      electricity: utilities.electricity || 0,
      subtotal: (utilities.water || 0) + (utilities.gas || 0) + (utilities.electricity || 0)
    };

    const adjustmentsData = {
      penalty: adjustments.penalty || 0,
      discount: adjustments.discount || 0,
      subtotal: (adjustments.penalty || 0) - (adjustments.discount || 0)
    };

    const total = baseCharges.subtotal + utilitiesData.subtotal + adjustmentsData.subtotal;

    // تعیین تاریخ سررسید
    const [year, monthNum] = month.split('-').map(Number);
    const dueDate = new Date(year, monthNum - 1, this.settings.dueDayOfMonth);

    // توضیحات محاسبه
    const description = [];
    if (unit.type === 'COMMERCIAL') {
      description.push(`ضریب تجاری: ${this.settings.commercialMultiplier}`);
    }
    if (baseCharges.maintenance > 0) {
      description.push(`نگهداری: ${unit.area}م² × ${this.settings.maintenanceRatePerSqm} تومان`);
    }
    if (baseCharges.elevator > 0) {
      description.push(`آسانسور: طبقه ${unit.floor} × ${this.settings.elevatorBaseRate} تومان`);
    }

    return {
      unitId: unit.id,
      baseCharges,
      utilities: utilitiesData,
      adjustments: adjustmentsData,
      total: Math.max(0, total),
      dueDate,
      description
    };
  }

  /**
   * محاسبه شارژ برای چندین واحد
   */
  calculateBulkCharges(
    units: Unit[],
    month: string,
    customUtilities: Record<number, { water?: number; gas?: number; electricity?: number }> = {},
    customAdjustments: Record<number, { penalty?: number; discount?: number }> = {}
  ): ChargeBreakdown[] {
    return units.map(unit => 
      this.calculateUnitCharge(
        unit,
        month,
        customUtilities[unit.id] || {},
        customAdjustments[unit.id] || {}
      )
    );
  }

  /**
   * محاسبه آمار کلی
   */
  calculateSummaryStats(charges: ChargeBreakdown[]): {
    totalAmount: number;
    averagePerUnit: number;
    totalUnits: number;
    breakdown: {
      baseCharges: number;
      utilities: number;
      adjustments: number;
    };
  } {
    const totalAmount = charges.reduce((sum, charge) => sum + charge.total, 0);
    const breakdown = charges.reduce(
      (acc, charge) => ({
        baseCharges: acc.baseCharges + charge.baseCharges.subtotal,
        utilities: acc.utilities + charge.utilities.subtotal,
        adjustments: acc.adjustments + charge.adjustments.subtotal
      }),
      { baseCharges: 0, utilities: 0, adjustments: 0 }
    );

    return {
      totalAmount,
      averagePerUnit: charges.length > 0 ? totalAmount / charges.length : 0,
      totalUnits: charges.length,
      breakdown
    };
  }
}

export default ChargeCalculator;
