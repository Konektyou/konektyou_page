import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProviderBankAccount from '@/models/ProviderBankAccount';
const jwt = require('jsonwebtoken');

// GET - Fetch bank account for the provider
export async function GET(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    const bankAccount = await ProviderBankAccount.findOne({ providerId });

    if (!bankAccount) {
      return NextResponse.json({
        success: true,
        bankAccount: null
      });
    }

    return NextResponse.json({
      success: true,
      bankAccount: {
        _id: bankAccount._id,
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber ? `****${bankAccount.accountNumber.slice(-4)}` : '',
        accountHolderName: bankAccount.accountHolderName,
        isActive: bankAccount.isActive
      }
    });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create or update bank account
export async function POST(request) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const providerId = decoded.id;

    const { bankName, accountNumber, accountHolderName } = await request.json();

    if (!bankName || !accountNumber) {
      return NextResponse.json(
        { success: false, message: 'Bank name and account number are required' },
        { status: 400 }
      );
    }

    // Check if bank account already exists
    const existingAccount = await ProviderBankAccount.findOne({ providerId });

    let bankAccount;
    if (existingAccount) {
      // Update existing account
      existingAccount.bankName = bankName.trim();
      existingAccount.accountNumber = accountNumber.trim();
      existingAccount.accountHolderName = accountHolderName?.trim() || '';
      await existingAccount.save();
      bankAccount = existingAccount;
    } else {
      // Create new account
      bankAccount = await ProviderBankAccount.create({
        providerId,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName?.trim() || '',
        isActive: true
      });
    }

    return NextResponse.json({
      success: true,
      message: existingAccount ? 'Bank account updated successfully' : 'Bank account added successfully',
      bankAccount: {
        _id: bankAccount._id,
        bankName: bankAccount.bankName,
        accountNumber: `****${bankAccount.accountNumber.slice(-4)}`,
        accountHolderName: bankAccount.accountHolderName,
        isActive: bankAccount.isActive
      }
    });
  } catch (error) {
    console.error('Error saving bank account:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

