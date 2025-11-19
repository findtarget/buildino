
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const chargeSchema = z.object({
  buildingId: z.number(),
  month: z.number().min(1).max(12),
  year: z.number(),
  details: z.array(z.object({
    unitId: z.number(),
    amount: z.number(),
    description: z.string().optional(),
  })),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = chargeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.errors, { status: 400 });
    }

    const { buildingId, month, year, details } = validation.data;

    const totalAmount = details.reduce((sum, detail) => sum + detail.amount, 0);

    const existingCharge = await prisma.monthlyCharge.findUnique({
      where: {
        buildingId_year_month: {
          buildingId,
          year,
          month,
        },
      },
    });

    let monthlyCharge;

    if (existingCharge) {
      // Update existing charge
      monthlyCharge = await prisma.monthlyCharge.update({
        where: { id: existingCharge.id },
        data: {
          totalAmount,
          isFinalized: true,
          chargeDetails: {
            deleteMany: {},
            create: details,
          },
        },
        include: {
          chargeDetails: {
            include: {
              unit: true,
            },
          },
        },
      });
    } else {
      // Create new charge
      monthlyCharge = await prisma.monthlyCharge.create({
        data: {
          buildingId,
          month,
          year,
          totalAmount,
          isFinalized: true,
          chargeDetails: {
            create: details,
          },
        },
        include: {
          chargeDetails: {
            include: {
              unit: true,
            },
          },
        },
      });
    }

    // Create or update transactions for each unit
    await prisma.transaction.deleteMany({
      where: {
        monthlyChargeId: monthlyCharge.id,
      },
    });

    const transactions = details.map((detail, index) => ({
      buildingId,
      unitId: detail.unitId,
      transactionNumber: `CHG-${year}${month.toString().padStart(2, '0')}-${detail.unitId}`,
      title: `شارژ ماه ${month} سال ${year}`,
      amount: detail.amount,
      type: 'Income' as const,
      category: 'MonthlyCharge',
      transactionDate: new Date(year, month - 1, new Date().getDate()),
      description: detail.description || `شارژ ماهانه واحد`,
      isCharge: true,
      monthlyChargeId: monthlyCharge.id,
    }));

    await prisma.transaction.createMany({
      data: transactions,
    });

    return NextResponse.json(monthlyCharge, { status: 201 });
  } catch (error) {
    console.error('Error creating charge:', error);
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
    const charges = await prisma.monthlyCharge.findMany({
      where: {
        buildingId: parseInt(buildingId),
      },
      include: {
        chargeDetails: {
          include: {
            unit: true,
          },
        },
      },
      orderBy: {
        year: 'desc',
      },
    });
    return NextResponse.json(charges);
  } catch (error) {
    console.error('Error fetching charges:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
