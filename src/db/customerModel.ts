import { eq } from 'drizzle-orm';
import { customer, InsertCustomer, Customer, CustomerUpdate, CustomerDelete } from '@/db/customerSchema';
import { Db } from '@/lib/dbUtils';

export async function customersGet(db: Db) {
    const data = await db.query.customer.findMany();
    return data;
}

export async function customerCreate(db: Db, data: InsertCustomer) {
    const result = await db.insert(customer).values(data).returning();
    return result[0];
}

