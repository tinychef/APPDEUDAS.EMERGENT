import { create } from 'zustand';
import {
  LoanParams,
  ExtraPayment,
  AmortizationResult,
  calcularAmortizacion,
} from '../utils/amortizacion';

// Demo data from user's Excel
const DEMO_PRESTAMO: LoanParams = {
  monto: 101400000,
  tasaEA: 0.1201,
  plazoMeses: 180,
  fechaDesembolso: '2025-03-25',
  estrategia: 'REDUCIR_PLAZO',
};

const DEMO_ABONOS: ExtraPayment[] = [
  { cuota: 1, monto: 650000, fecha: '2025-03-12' },
  { cuota: 2, monto: 655000, fecha: '2025-04-12' },
  { cuota: 4, monto: 320000, fecha: '2025-06-12' },
  { cuota: 5, monto: 670000, fecha: '2025-07-12' },
  { cuota: 6, monto: 777000, fecha: '2025-08-12' },
  { cuota: 7, monto: 655555, fecha: '2025-09-12' },
  { cuota: 8, monto: 500000, fecha: '2025-10-12' },
  { cuota: 10, monto: 770000, fecha: '2025-12-12' },
  { cuota: 11, monto: 1000000, fecha: '2026-01-12' },
  { cuota: 12, monto: 1000000, fecha: '2026-02-12' },
];

interface DebtState {
  // Loan configuration
  prestamo: LoanParams;
  abonos: ExtraPayment[];
  
  // Calculated results
  resultado: AmortizationResult | null;
  
  // UI State
  isLoading: boolean;
  hasSetup: boolean;
  
  // Actions
  setPrestamo: (params: LoanParams) => void;
  addAbono: (abono: ExtraPayment) => void;
  removeAbono: (cuota: number) => void;
  recalculate: () => void;
  loadDemoData: () => void;
  reset: () => void;
}

export const useDebtStore = create<DebtState>((set, get) => ({
  prestamo: DEMO_PRESTAMO,
  abonos: DEMO_ABONOS,
  resultado: null,
  isLoading: false,
  hasSetup: true,

  setPrestamo: (params) => {
    set({ prestamo: params, hasSetup: true });
    get().recalculate();
  },

  addAbono: (abono) => {
    const { abonos } = get();
    // Check if there's already an abono for this cuota
    const existingIndex = abonos.findIndex((a) => a.cuota === abono.cuota);
    
    let newAbonos: ExtraPayment[];
    if (existingIndex >= 0) {
      // Update existing
      newAbonos = [...abonos];
      newAbonos[existingIndex] = abono;
    } else {
      // Add new
      newAbonos = [...abonos, abono].sort((a, b) => a.cuota - b.cuota);
    }
    
    set({ abonos: newAbonos });
    get().recalculate();
  },

  removeAbono: (cuota) => {
    const { abonos } = get();
    set({ abonos: abonos.filter((a) => a.cuota !== cuota) });
    get().recalculate();
  },

  recalculate: () => {
    const { prestamo, abonos } = get();
    set({ isLoading: true });
    
    // Simulate async calculation for smooth UX
    setTimeout(() => {
      const resultado = calcularAmortizacion(prestamo, abonos);
      set({ resultado, isLoading: false });
    }, 100);
  },

  loadDemoData: () => {
    set({
      prestamo: DEMO_PRESTAMO,
      abonos: DEMO_ABONOS,
      hasSetup: true,
    });
    get().recalculate();
  },

  reset: () => {
    set({
      prestamo: {
        monto: 0,
        tasaEA: 0,
        plazoMeses: 0,
        fechaDesembolso: new Date().toISOString().split('T')[0],
        estrategia: 'REDUCIR_PLAZO',
      },
      abonos: [],
      resultado: null,
      hasSetup: false,
    });
  },
}));

// Initialize with demo data
setTimeout(() => {
  useDebtStore.getState().recalculate();
}, 0);
