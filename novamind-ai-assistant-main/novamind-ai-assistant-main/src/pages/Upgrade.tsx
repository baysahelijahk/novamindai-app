
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Check, Crown, Zap, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Upgrade = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plans = [
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 25,
      currency: 'USD',
      features: [
        '500 messages total',
        'GPT-4 access',
        'File upload & reading',
        'Priority support',
        'Advanced features'
      ]
    },
    {
      id: 'premium', 
      name: 'Premium Plan',
      price: 40,
      currency: 'USD',
      features: [
        'Unlimited messages',
        'GPT-4.1 Turbo access',
        'Document analysis',
        'Business tools',
        'Premium support',
        'All features included'
      ]
    },
    {
      id: 'pay_as_you_go',
      name: 'Pay As You Go',
      price: 3,
      currency: 'USD',
      features: [
        'Token-based usage',
        'GPT-4 access',
        'File uploads',
        'Flexible pricing',
        'No monthly limits'
      ]
    }
  ];

  const paymentMethods = [
    { id: 'mtn_mobile_money', name: 'MTN Mobile Money' },
    { id: 'orange_money', name: 'Orange Money' },
    { id: 'lonestar_money', name: 'Lonestar Money' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const handleSubmitUpgrade = async () => {
    if (!selectedPlan || !paymentMethod || !receiptFile) {
      toast.error('Please fill in all required fields and upload your receipt');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload receipt file to storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      const receiptUrl = supabase.storage.from('receipts').getPublicUrl(fileName).data?.publicUrl;

      // Create payment request
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      
      const { error: requestError } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user?.id,
          plan_requested: selectedPlan,
          amount: selectedPlanData?.price || 0,
          payment_method: paymentMethod,
          receipt_url: receiptUrl,
          status: 'pending',
          is_lifetime: true,
          payment_reference: `UPGRADE_${Date.now()}`
        });

      if (requestError) throw requestError;

      toast.success('Upgrade request submitted successfully! We will review your payment and activate your plan within 24 hours.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting upgrade request:', error);
      toast.error('Failed to submit upgrade request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppUpgrade = () => {
    const planName = plans.find(p => p.id === selectedPlan)?.name || 'Pro Plan';
    const message = `Hi, I would like to upgrade to the ${planName} for Novamind AI Assistant. My account email is ${user?.email}`;
    const whatsappUrl = `https://wa.me/231778199366?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold">Upgrade Your Plan</h1>
                <p className="text-sm text-gray-400">Choose your lifetime plan - Pay once, use forever</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Current Plan */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gray-500 text-white capitalize">
                {profile?.plan || 'free'}
              </Badge>
              <span className="text-gray-300">
                {profile?.plan === 'free' ? '50 messages total' : 
                 profile?.plan === 'pro' ? '500 messages total' :
                 profile?.plan === 'premium' ? 'Unlimited messages' : 'Token-based'}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
            <div className="space-y-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
                    selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center">
                        {plan.id === 'premium' && <Crown className="h-5 w-5 mr-2" />}
                        {plan.id === 'pay_as_you_go' && <Zap className="h-5 w-5 mr-2" />}
                        {plan.name}
                      </CardTitle>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-400">
                          ${plan.price} {plan.currency}
                        </div>
                        <div className="text-sm text-green-400">
                          {plan.id === 'pay_as_you_go' ? 'Per usage' : 'One-time payment'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
            
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Mobile Money Payment</CardTitle>
                <CardDescription className="text-gray-400">
                  Pay using your mobile money account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payment-method" className="text-white">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="receipt" className="text-white">Upload Receipt Screenshot</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Upload a screenshot of your payment confirmation
                  </p>
                </div>

                <Button 
                  onClick={handleSubmitUpgrade}
                  disabled={!selectedPlan || !paymentMethod || !receiptFile || isSubmitting}
                  className="w-full bg-red-600 text-white hover:bg-red-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Upgrade Request'}
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp Alternative */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Need Help?</CardTitle>
                <CardDescription className="text-gray-400">
                  Contact us directly for assistance with your upgrade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleWhatsAppUpgrade}
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-700 bg-red-600 hover:bg-red-700"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp: +231 778 199 366
                </Button>
                <Button 
                  onClick={() => window.open('mailto:novamind@baysahdesign.com', '_blank')}
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-700 bg-red-600 hover:bg-red-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  novamind@baysahdesign.com
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Instructions */}
        <Card className="bg-gray-800 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">MTN Mobile Money</h4>
                <p className="text-sm text-gray-400">
                  Send payment to: [MTN Number]<br/>
                  Reference: NOVAMIND-UPGRADE
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Orange Money</h4>
                <p className="text-sm text-gray-400">
                  Send payment to: [Orange Number]<br/>
                  Reference: NOVAMIND-UPGRADE
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Lonestar Money</h4>
                <p className="text-sm text-gray-400">
                  Send payment to: [Lonestar Number]<br/>
                  Reference: NOVAMIND-UPGRADE
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-900 rounded-lg">
              <p className="text-blue-200 text-sm">
                <strong>Important:</strong> After making payment, upload your receipt screenshot above. 
                Your account will be upgraded within 24 hours after verification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upgrade;
