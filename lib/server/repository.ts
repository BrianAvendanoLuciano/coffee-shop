import type { Employee, Order, Product } from '@/types/common';

// Generic constraint: T can be anything, as long as it has a string id.
export interface Entity {
  id: string;
}

// The interface is the contract the rest of the server depends on. Swapping
// the in-memory store for a real database means writing one new class that
// implements it; nothing that uses Repository<Order> has to change.
export interface Repository<T extends Entity> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  save(entity: T): Promise<T>;
}

export abstract class InMemoryRepository<T extends Entity>
  implements Repository<T>
{
  // `private`: not even subclasses can touch the map directly.
  private readonly items = new Map<string, T>();

  // `protected`: callable from subclasses only, so the base class can never
  // be constructed on its own.
  protected constructor(seed: readonly T[]) {
    for (const item of seed) this.items.set(item.id, item);
  }

  // Each concrete repository decides its own default ordering.
  protected abstract compare(a: T, b: T): number;

  async findAll(): Promise<T[]> {
    return structuredClone(
      [...this.items.values()].sort((a, b) => this.compare(a, b)),
    );
  }

  async findById(id: string): Promise<T | undefined> {
    const found = this.items.get(id);
    return found && structuredClone(found);
  }

  async save(entity: T): Promise<T> {
    this.items.set(entity.id, structuredClone(entity));
    return entity;
  }
}

export class ProductRepository extends InMemoryRepository<Product> {
  constructor(seed: readonly Product[]) {
    super(seed);
  }

  protected compare(a: Product, b: Product): number {
    return a.id.localeCompare(b.id);
  }
}

export class OrderRepository extends InMemoryRepository<Order> {
  constructor(seed: readonly Order[] = []) {
    super(seed);
  }

  // Newest first.
  protected compare(a: Order, b: Order): number {
    return b.createdAt.localeCompare(a.createdAt);
  }
}

export class EmployeeRepository extends InMemoryRepository<Employee> {
  constructor(seed: readonly Employee[]) {
    super(seed);
  }

  protected compare(a: Employee, b: Employee): number {
    return a.name.localeCompare(b.name);
  }
}
