// DebtMap - Amortization Engine
// Translates Excel logic to TypeScript

export interface LoanParams {
  monto: number;
  tasaEA: number;
  plazoMeses: number;
  fechaDesembolso: string;
  estrategia: 'REDUCIR_PLAZO' | 'REDUCIR_CUOTA';
}

export interface ExtraPayment {
  cuota: number;
  monto: number;
  fecha: string;
}

export interface PaymentRow {
  cuota: number;
  fecha: Date;
  cuotaMensual: number;
  interes: number;
  abonoCapital: number;
  abonoExtra: number;
  saldoFinal: number;
  estado: 'PAGADA' | 'PROXIMA' | 'PENDIENTE';
}

export interface AmortizationResult {
  cronograma: PaymentRow[];
  cronogramaSinAbonos: PaymentRow[];
  resumen: {
    cuotaMensual: number;
    plazoReal: number;
    plazoOriginal: number;
    mesesAhorrados: number;
    totalInteresesSinAbonos: number;
    totalInteresesConAbonos: number;
    ahorroIntereses: number;
    porcentajeAhorro: number;
    totalAbonos: number;
    totalPagadoSinAbonos: number;
    totalPagadoConAbonos: number;
    fechaFinOriginal: Date;
    fechaFinReal: Date;
  };
}

// Convert annual effective rate to monthly effective rate
export function tasaEAtoEM(tasaEA: number): number {
  return Math.pow(1 + tasaEA, 1 / 12) - 1;
}

// Calculate fixed monthly payment
export function calcularCuotaMensual(
  monto: number,
  tasaEM: number,
  plazoMeses: number
): number {
  return (monto * tasaEM) / (1 - Math.pow(1 + tasaEM, -plazoMeses));
}

// Add months to a date
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// Get payment status based on current date
function getPaymentStatus(
  fechaPago: Date,
  cuotaActual: number,
  totalCuotas: number
): 'PAGADA' | 'PROXIMA' | 'PENDIENTE' {
  const today = new Date();
  const todayMonth = today.getFullYear() * 12 + today.getMonth();
  const paymentMonth = fechaPago.getFullYear() * 12 + fechaPago.getMonth();

  if (paymentMonth < todayMonth) {
    return 'PAGADA';
  } else if (paymentMonth === todayMonth) {
    return 'PROXIMA';
  }
  return 'PENDIENTE';
}

// Main amortization calculation
export function calcularAmortizacion(
  params: LoanParams,
  abonos: ExtraPayment[] = []
): AmortizationResult {
  const { monto, tasaEA, plazoMeses, fechaDesembolso } = params;
  const tasaEM = tasaEAtoEM(tasaEA);
  const cuotaMensual = calcularCuotaMensual(monto, tasaEM, plazoMeses);
  const fechaInicio = new Date(fechaDesembolso);

  // Calculate schedule WITHOUT extra payments
  let saldoSinAbonos = monto;
  const cronogramaSinAbonos: PaymentRow[] = [];
  let totalInteresesSinAbonos = 0;

  for (let i = 1; i <= plazoMeses && saldoSinAbonos > 0.01; i++) {
    const fechaPago = addMonths(fechaInicio, i);
    const interes = saldoSinAbonos * tasaEM;
    const abonoCapital = Math.min(cuotaMensual - interes, saldoSinAbonos);
    saldoSinAbonos = Math.max(0, saldoSinAbonos - abonoCapital);
    totalInteresesSinAbonos += interes;

    cronogramaSinAbonos.push({
      cuota: i,
      fecha: fechaPago,
      cuotaMensual: i === plazoMeses && saldoSinAbonos + abonoCapital + interes < cuotaMensual 
        ? saldoSinAbonos + abonoCapital + interes 
        : cuotaMensual,
      interes: Math.round(interes),
      abonoCapital: Math.round(abonoCapital),
      abonoExtra: 0,
      saldoFinal: Math.round(saldoSinAbonos),
      estado: getPaymentStatus(fechaPago, i, plazoMeses),
    });
  }

  // Calculate schedule WITH extra payments
  let saldoConAbonos = monto;
  const cronograma: PaymentRow[] = [];
  let totalInteresesConAbonos = 0;
  let totalAbonos = 0;

  for (let i = 1; i <= plazoMeses && saldoConAbonos > 0.01; i++) {
    const fechaPago = addMonths(fechaInicio, i);
    const interes = saldoConAbonos * tasaEM;
    
    // Get extra payments for this month
    const abonoExtraMes = abonos
      .filter((a) => a.cuota === i)
      .reduce((sum, a) => sum + a.monto, 0);
    
    totalAbonos += abonoExtraMes;

    const abonoCapitalBase = cuotaMensual - interes;
    const abonoCapitalTotal = Math.min(
      abonoCapitalBase + abonoExtraMes,
      saldoConAbonos
    );
    
    saldoConAbonos = Math.max(0, saldoConAbonos - abonoCapitalTotal);
    totalInteresesConAbonos += interes;

    // Determine actual cuota (last payment might be smaller)
    const cuotaReal = saldoConAbonos <= 0 && i < plazoMeses
      ? interes + abonoCapitalTotal - abonoExtraMes
      : cuotaMensual;

    cronograma.push({
      cuota: i,
      fecha: fechaPago,
      cuotaMensual: Math.round(cuotaReal),
      interes: Math.round(interes),
      abonoCapital: Math.round(abonoCapitalTotal),
      abonoExtra: Math.round(abonoExtraMes),
      saldoFinal: Math.round(saldoConAbonos),
      estado: getPaymentStatus(fechaPago, i, cronograma.length + (saldoConAbonos > 0 ? 1 : 0)),
    });

    if (saldoConAbonos <= 0) break;
  }

  const plazoReal = cronograma.length;
  const mesesAhorrados = plazoMeses - plazoReal;
  const ahorroIntereses = totalInteresesSinAbonos - totalInteresesConAbonos;
  const porcentajeAhorro = (ahorroIntereses / totalInteresesSinAbonos) * 100;

  return {
    cronograma,
    cronogramaSinAbonos,
    resumen: {
      cuotaMensual: Math.round(cuotaMensual),
      plazoReal,
      plazoOriginal: plazoMeses,
      mesesAhorrados,
      totalInteresesSinAbonos: Math.round(totalInteresesSinAbonos),
      totalInteresesConAbonos: Math.round(totalInteresesConAbonos),
      ahorroIntereses: Math.round(ahorroIntereses),
      porcentajeAhorro,
      totalAbonos: Math.round(totalAbonos),
      totalPagadoSinAbonos: Math.round(monto + totalInteresesSinAbonos),
      totalPagadoConAbonos: Math.round(monto + totalInteresesConAbonos),
      fechaFinOriginal: addMonths(fechaInicio, plazoMeses),
      fechaFinReal: addMonths(fechaInicio, plazoReal),
    },
  };
}

// Format currency for Colombian Pesos
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format short currency (millions)
export function formatShortCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
}

// Format percentage
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Format date to month-year
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// Calculate months between dates
export function monthsDiff(start: Date, end: Date): string {
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
    (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years > 0 && remainingMonths > 0) {
    return `${years} años y ${remainingMonths} meses`;
  } else if (years > 0) {
    return `${years} años`;
  }
  return `${remainingMonths} meses`;
}
