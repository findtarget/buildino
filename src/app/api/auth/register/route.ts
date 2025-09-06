// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// تست کردن import prisma
let prisma: any;
try {
  const prismaModule = await import('@/lib/db/prisma');
  prisma = prismaModule.prisma;
  console.log('✅ Prisma imported successfully');
} catch (error) {
  console.error('❌ Failed to import Prisma:', error);
}

export async function POST(request: Request) {
    try {
        console.log('🚀 Register API started');
        
        // چک کردن prisma
        if (!prisma) {
            console.error('❌ Prisma client is not available');
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Database connection error' 
                },
                { status: 500 }
            );
        }

        console.log('✅ Prisma client is available');
        
        const body = await request.json();
        console.log('📝 Request body received:', { 
            ...body, 
            password: '***hidden***' 
        });
        
        const { firstName, lastName, email, phone, password } = body;

        // اعتبارسنجی
        if (!firstName || !lastName || !email || !password) {
            console.log('❌ Missing required fields');
            return NextResponse.json(
                { 
                    success: false,
                    error: 'نام، نام خانوادگی، ایمیل و رمز عبور الزامی هستند.' 
                },
                { status: 400 }
            );
        }

        // اعتبارسنجی ایمیل
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format:', email);
            return NextResponse.json(
                { 
                    success: false,
                    error: 'فرمت ایمیل نامعتبر است.' 
                },
                { status: 400 }
            );
        }

        // اعتبارسنجی رمز عبور
        if (password.length < 8) {
            console.log('❌ Password too short');
            return NextResponse.json(
                { 
                    success: false,
                    error: 'رمز عبور باید حداقل 8 کاراکتر باشد.' 
                },
                { status: 400 }
            );
        }

        console.log('✅ All validations passed');

        // تست اتصال به دیتابیس
        console.log('🔍 Testing database connection...');
        try {
            // ابتدا چک کنیم کدام جدول موجود است
            const tableNames = ['User', 'user', 'users'];
            let userModel = null;
            
            for (const tableName of tableNames) {
                try {
                    if (prisma[tableName]) {
                        console.log(`✅ Found table: ${tableName}`);
                        userModel = prisma[tableName];
                        break;
                    }
                } catch (e) {
                    console.log(`❌ Table ${tableName} not found`);
                }
            }
            
            if (!userModel) {
                console.error('❌ No user table found');
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'Database schema error' 
                    },
                    { status: 500 }
                );
            }

            // بررسی ایمیل تکراری
            console.log('🔍 Checking existing email...');
            const existingUserByEmail = await userModel.findUnique({
                where: { email: email.toLowerCase() },
            });
            
            if (existingUserByEmail) {
                console.log('❌ Email already exists:', email);
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'این ایمیل قبلاً ثبت شده است.' 
                    },
                    { status: 409 }
                );
            }

            // بررسی تلفن تکراری
            if (phone) {
                console.log('🔍 Checking existing phone...');
                const cleanPhone = phone.replace(/\s|-/g, '');
                const existingUserByPhone = await userModel.findUnique({
                    where: { phone: cleanPhone },
                });
                
                if (existingUserByPhone) {
                    console.log('❌ Phone already exists:', cleanPhone);
                    return NextResponse.json(
                        { 
                            success: false,
                            error: 'این شماره تلفن قبلاً ثبت شده است.' 
                        },
                        { status: 409 }
                    );
                }
            }

            // هش رمز عبور
            console.log('🔐 Hashing password...');
            const hashedPassword = await bcrypt.hash(password, 12);

            // ایجاد نام کاربری
            const baseUsername = email.split('@')[0].toLowerCase();
            let username = baseUsername;
            
            console.log('🔍 Checking username availability...');
            let counter = 1;
            while (true) {
                const existingUser = await userModel.findUnique({
                    where: { username }
                });
                
                if (!existingUser) break;
                
                username = `${baseUsername}${counter}`;
                counter++;
            }
            console.log('✅ Username available:', username);

            // ایجاد کاربر
            console.log('💾 Creating user...');
            
            // داده‌ها بر اساس schema واقعی
            const userData = {
                username,
                email: email.toLowerCase(),
                password: hashedPassword, // یا password_hash بر اساس schema
                fullName: `${firstName.trim()} ${lastName.trim()}`, // یا full_name
                phone: phone ? phone.replace(/\s|-/g, '') : null,
                buildingId: 1, // یا building_id
                role: 'manager', // یا 'RESIDENT' بر اساس enum
                isActive: true, // یا is_active
                createdAt: new Date(), // یا created_at
            };

            console.log('📝 User data to create:', { 
                ...userData, 
                password: '***hidden***' 
            });

            const user = await userModel.create({
                data: userData,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    fullName: true,
                    phone: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                }
            });

            console.log('✅ User created successfully:', user.id);

            return NextResponse.json({
                success: true,
                data: user,
                message: 'کاربر با موفقیت ثبت شد.'
            }, { status: 201 });

        } catch (dbError) {
            console.error('💥 Database error:', dbError);
            
            if (dbError instanceof Error) {
                console.log('Error message:', dbError.message);
                console.log('Error name:', dbError.name);
                
                if (dbError.message.includes('Unique constraint')) {
                    return NextResponse.json(
                        { 
                            success: false,
                            error: 'اطلاعات تکراری وارد شده است.' 
                        },
                        { status: 409 }
                    );
                }
            }
            
            return NextResponse.json(
                { 
                    success: false,
                    error: 'خطا در اتصال به پایگاه داده' 
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('💥 General error:', error);
        
        return NextResponse.json(
            { 
                success: false,
                error: 'خطای سرور' 
            },
            { status: 500 }
        );
    }
}
