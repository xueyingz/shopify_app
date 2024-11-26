export const createCustomer = async ({name, email}: any) => {
    return await prisma.customer.create({
        data: {
            id: '12345',
            name,
            email,
        } as any
    });
};