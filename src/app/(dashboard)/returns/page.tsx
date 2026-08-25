import ReturnsClient from "@/components/ReturnsClient";
import prisma from "@/lib/prisma";

export default async function ReturnsPage() {
  const returns = await prisma.salesReturn.findMany({
    include: {
      customer: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const customers = await prisma.customer.findMany({
    select: { id: true, name: true, phone: true }
  });

  const products = await prisma.product.findMany({
    select: { id: true, name: true, code: true, barcode: true, price: true, stock: true }
  });

  return (
    <ReturnsClient 
      initialReturns={returns} 
      customers={customers} 
      products={products} 
    />
  );
}
