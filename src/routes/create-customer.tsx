import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { customerCreate, customersGet } from '@/db/customerModel'
import { dbMiddleware } from '@/lib/db-middleware'
import { useState } from 'react'

const createCustomer = createServerFn({ method: 'POST' })
    .middleware([dbMiddleware])
    .handler(async (ctx) => {
        const { name } = ctx.data as { name: string }
        const newCustomer = await customerCreate(ctx.context?.db, { name })
        return newCustomer
    })

const getAllCustomers = createServerFn({ method: 'GET' })
    .middleware([dbMiddleware])
    .handler(async (ctx) => {
        return customersGet(ctx.context?.db)
    })

export const Route = createFileRoute('/create-customer')({
    component: CreateCustomerComponent,
    loader: async () => {
        const customers = await getAllCustomers()
        return { customers }
    },
})

function CreateCustomerComponent() {
    const { customers: initialCustomers } = Route.useLoaderData()
    const [customerName, setCustomerName] = useState('')
    const [customers, setCustomers] = useState(initialCustomers)
    const [createdCustomer, setCreatedCustomer] = useState<any>(null)
    const [isCreating, setIsCreating] = useState(false)

    const handleCreateCustomer = async () => {
        if (!customerName.trim()) {
            alert('Please enter a customer name')
            return
        }

        setIsCreating(true)
        try {
            const newCustomer = await createCustomer({ data: { name: customerName } })
            setCreatedCustomer(newCustomer)

            // Refresh the customer list
            const updatedCustomers = await getAllCustomers()
            setCustomers(updatedCustomers)

            // Clear the input
            setCustomerName('')
        } catch (error) {
            console.error('Error creating customer:', error)
            alert('Failed to create customer')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Create Customer</h1>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    style={{
                        padding: '10px',
                        fontSize: '16px',
                        marginRight: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                    }}
                    disabled={isCreating}
                />
                <button
                    onClick={handleCreateCustomer}
                    disabled={isCreating}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isCreating ? 'not-allowed' : 'pointer',
                        opacity: isCreating ? 0.6 : 1,
                    }}
                >
                    {isCreating ? 'Creating...' : 'Create Customer'}
                </button>
            </div>

            {createdCustomer && (
                <div
                    style={{
                        padding: '15px',
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '4px',
                        marginBottom: '20px',
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>Customer Created Successfully!</h3>
                    <p>
                        <strong>ID:</strong> {createdCustomer.id}
                    </p>
                    <p>
                        <strong>Name:</strong> {createdCustomer.name}
                    </p>
                    <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                        {JSON.stringify(createdCustomer, null, 2)}
                    </pre>
                </div>
            )}

            <div>
                <h2>All Customers ({customers.length})</h2>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {customers.map((customer) => (
                        <div
                            key={customer.id}
                            style={{
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                            }}
                        >
                            <strong>ID {customer.id}:</strong> {customer.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
