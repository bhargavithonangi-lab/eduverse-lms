import React, { useState } from 'react';
import { Course, User } from '../types.js';
import { api } from '../lib/api.js';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  DollarSign,
  ArrowRight,
  FileText
} from 'lucide-react';

interface CheckoutModalProps {
  course: Course | null;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  course,
  currentUser,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState(currentUser.name);
  const [upiId, setUpiId] = useState('alex@okaxis');

  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

  if (!isOpen || !course) return null;

  const finalPrice = course.discountPrice || course.price;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await api.processPayment({
        courseId: course.id,
        userId: currentUser.id,
        amount: finalPrice,
        paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'upi' ? 'UPI' : 'PayPal'
      });

      setReceipt(res.payment);
      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (err) {
      console.error('Payment failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Secure 256-Bit Checkout</h2>
              <p className="text-xs text-indigo-200">Instant lifetime enrollment & certificate access</p>
            </div>
          </div>

          <button onClick={onClose} className="text-white/70 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {receipt ? (
          /* Payment Success View */
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Payment Successful!</h3>
            <p className="text-xs text-slate-600">
              You are now fully enrolled in <strong>{course.title}</strong>.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-bold text-slate-800">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-bold text-slate-800">{receipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">${receipt.amount} USD</span>
              </div>
            </div>

            <p className="text-xs text-indigo-600 font-semibold animate-pulse">
              Redirecting to your interactive classroom...
            </p>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleProcessPayment} className="p-6 space-y-6 text-xs sm:text-sm">
            
            {/* Order summary card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center gap-4">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-16 h-14 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1 truncate">
                <h4 className="font-bold text-slate-900 truncate">{course.title}</h4>
                <div className="text-xs text-slate-500 mt-0.5">Instructor: {course.instructorName}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-slate-900">${finalPrice}</div>
                {course.discountPrice && (
                  <div className="text-[11px] text-slate-400 line-through">${course.price}</div>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">Payment Option</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  Card
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'upi'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  UPI / GPay
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'paypal'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  PayPal
                </button>
              </div>
            </div>

            {/* Form Fields according to method */}
            {paymentMethod === 'card' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Expires</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">VPA / UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  A verification prompt will be sent to your device to authorize the transaction.
                </p>
              </div>
            )}

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Includes 30-day money-back guarantee & verifiable certificate.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition disabled:opacity-50 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Securing Transaction...
                </>
              ) : (
                <>
                  Complete Enrollment • ${finalPrice} USD
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
