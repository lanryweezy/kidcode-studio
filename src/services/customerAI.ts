export interface Customer {
  id: string;
  emoji: string;
  name: string;
  patience: number;
  maxPatience: number;
  budget: number;
  satisfaction: number;
  items: string[];
  state: 'entering' | 'browsing' | 'waiting' | 'served' | 'leaving' | 'angry';
  spawnTime: number;
}

const CUSTOMER_EMOJIS = ['🧑', '👩', '👴', '👧', '👦', '🧔', '👩‍🦰', '👨‍🦱', '🧑‍🦳', '👩‍🦱'];
const CUSTOMER_NAMES = ['Alex', 'Sam', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery'];

export function createCustomer(
  availableProducts: string[],
  reputation: number = 50,
  difficulty: number = 1
): Customer {
  const productCount = 1 + Math.floor(Math.random() * 3);
  const selectedProducts: string[] = [];
  for (let i = 0; i < productCount && availableProducts.length > 0; i++) {
    const idx = Math.floor(Math.random() * availableProducts.length);
    selectedProducts.push(availableProducts[idx]);
  }

  return {
    id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    emoji: CUSTOMER_EMOJIS[Math.floor(Math.random() * CUSTOMER_EMOJIS.length)],
    name: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
    patience: (30 + Math.random() * 30) * (reputation / 50),
    maxPatience: (30 + Math.random() * 30) * (reputation / 50),
    budget: 20 + Math.floor(Math.random() * 80) * difficulty,
    satisfaction: 80 + Math.floor(Math.random() * 20),
    items: selectedProducts,
    state: 'entering',
    spawnTime: Date.now(),
  };
}

export function updateCustomer(customer: Customer, dt: number): Customer {
  const newPatience = customer.patience - dt;

  if (newPatience <= 0) {
    return { ...customer, patience: 0, state: 'angry' };
  }

  if (customer.state === 'entering') {
    return { ...customer, patience: newPatience, state: 'browsing' };
  }

  if (customer.state === 'browsing' && newPatience < customer.maxPatience * 0.5) {
    return { ...customer, patience: newPatience, state: 'waiting' };
  }

  return { ...customer, patience: newPatience };
}

export function serveCustomer(customer: Customer, productId: string): Customer {
  const newItems = customer.items.filter(i => i !== productId);
  const newState = newItems.length === 0 ? 'served' : 'browsing';

  return {
    ...customer,
    items: newItems,
    state: newState as any,
    satisfaction: Math.min(100, customer.satisfaction + 10),
  };
}

export function removeAngryCustomers(customers: Customer[]): {
  active: Customer[];
  angryCount: number;
} {
  const angry = customers.filter(c => c.state === 'angry');
  const active = customers.filter(c => c.state !== 'angry');
  return { active, angryCount: angry.length };
}

export function getSpawnChance(reputation: number, currentCustomers: number, maxCustomers: number): number {
  const repFactor = reputation / 100;
  const capacityFactor = 1 - (currentCustomers / maxCustomers);
  return 0.3 * repFactor * capacityFactor;
}
