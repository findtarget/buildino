
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const transactionSchema = z.object({
  buildingId: z.number(),
  unitId: z.number().optional(),
  title: z.string(),
  amount: z.number(),
  type: z.enum(['Income', 'Expense']),
  category: z.string(),
  transactionDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = transactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.errors, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...validation.data,
        transactionDate: new Date(validation.data.transactionDate),
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const buildingId = searchParams.get('buildingId');

  if (!buildingId) {
    return NextResponse.json({ message: 'Building ID is required' }, { status: 400 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        buildingId: parseInt(buildingId),
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
