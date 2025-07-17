import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, FileText, CreditCard, LogOut, Crown, Zap, Upload, Phone, Mail, User, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
const Dashboard = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    profile,
    loading
  } = useProfile();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };
  const handleUpgrade = () => {
    window.open('https://wa.me/231778199366', '_blank');
  };
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-500';
      case 'pro':
        return 'bg-blue-500';
      case 'premium':
        return 'bg-purple-500';
      case 'pay_as_you_go':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Crown className="h-4 w-4" />;
      case 'pay_as_you_go':
        return <Zap className="h-4 w-4" />;
      default:
        return null;
    }
  };
  const getMessageProgress = () => {
    if (!profile) return 0;
    const maxMessages = profile.plan === 'free' ? 50 : profile.plan === 'pro' ? 500 : 1000;
    return (profile.messages_remaining || 0) / maxMessages * 100;
  };
  const canUploadFiles = profile?.plan === 'pro' || profile?.plan === 'premium' || profile?.plan === 'pay_as_you_go';
  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              <div>
                <h1 className="text-xl font-bold">Novamind AI Assistant</h1>
                <p className="text-sm text-gray-400">Welcome back, {profile?.full_name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={`${getPlanColor(profile?.plan || 'free')} text-white`}>
                {getPlanIcon(profile?.plan || 'free')}
                <span className="ml-1 capitalize">{profile?.plan || 'free'}</span>
              </Badge>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Menu */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Button onClick={() => navigate('/chat')} className="bg-red-600 text-white hover:bg-red-700 h-20 flex-col">
            <MessageSquare className="h-6 w-6 mb-2" />
            <span>Chat</span>
          </Button>
          
          {canUploadFiles && <Button onClick={() => navigate('/upload')} className="bg-red-600 text-white hover:bg-red-700 h-20 flex-col">
              <Upload className="h-6 w-6 mb-2" />
              <span>Upload File</span>
            </Button>}
          
          <Button onClick={() => navigate('/')} className="bg-red-600 text-white hover:bg-red-700 h-20 flex-col">
            <Home className="h-6 w-6 mb-2" />
            <span>Home</span>
          </Button>
          
          <Button onClick={handleUpgrade} className="bg-red-600 text-white hover:bg-red-700 h-20 flex-col">
            <Crown className="h-6 w-6 mb-2" />
            <span>Upgrade</span>
          </Button>
          
          <Button onClick={() => window.open('https://wa.me/231778199366', '_blank')} className="bg-red-600 text-white hover:bg-red-700 h-20 flex-col">
            <Phone className="h-6 w-6 mb-2" />
            <span>Support</span>
          </Button>
          
          <Button onClick={() => navigate('/profile')} className="bg-red-600 text-white hover:bg-red-700 h-20 flex-col">
            <User className="h-6 w-6 mb-2" />
            <span>Account</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Usage Stats */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Remaining</span>
                  <span className="text-white">
                    {profile?.messages_remaining || 0}
                    {profile?.plan === 'premium' ? ' (Unlimited)' : ''}
                  </span>
                </div>
                {profile?.plan !== 'premium' && <Progress value={getMessageProgress()} className="h-2" />}
              </div>
            </CardContent>
          </Card>

          {/* Tokens (Pay-as-you-go) */}
          {profile?.plan === 'pay_as_you_go' && <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {profile?.tokens_remaining || 0}
                </div>
                <p className="text-sm text-gray-400">Available tokens</p>
              </CardContent>
            </Card>}

          {/* Account Overview */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white">{profile?.full_name || 'Not set'}</p>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{user?.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Information */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Your Plan - One-Time Purchase
            </CardTitle>
            <CardDescription className="text-gray-400">
              Lifetime access with no recurring fees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 capitalize">
                  {profile?.plan || 'free'} Plan
                </h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  {profile?.plan === 'free' && <>
                      <li>• 50 messages total</li>
                      <li>• GPT-3.5 Turbo access</li>
                      <li>• Basic chat functionality</li>
                    </>}
                  {profile?.plan === 'pro' && <>
                      <li>• 500 messages total</li>
                      <li>• GPT-4 access</li>
                      <li>• File upload & reading</li>
                      <li>• Priority support</li>
                    </>}
                  {profile?.plan === 'premium' && <>
                      <li>• Unlimited messages</li>
                      <li>• GPT-4.1 Turbo access</li>
                      <li>• Document analysis</li>
                      <li>• Business tools</li>
                      <li>• Premium support</li>
                    </>}
                  {profile?.plan === 'pay_as_you_go' && <>
                      <li>• Token-based pricing</li>
                      <li>• GPT-4 access</li>
                      <li>• All premium features</li>
                      <li>• Flexible usage</li>
                    </>}
                </ul>
              </div>
              <div className="space-y-4">
                {profile?.plan === 'free' && <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                    <h4 className="font-semibold mb-2">Upgrade to unlock more features!</h4>
                    <p className="text-sm mb-3">Get lifetime access to advanced AI models and features.</p>
                    <Button onClick={handleUpgrade} className="bg-white text-blue-600 hover:bg-gray-100">
                      Upgrade Now
                    </Button>
                  </div>}
                {profile?.plan !== 'free' && <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-white">Need more features?</h4>
                    <Button onClick={handleUpgrade} variant="outline" className="border-gray-600 text-white hover:bg-gray-600">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Need Help?</CardTitle>
            <CardDescription className="text-gray-400">
              Get support for your account and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={() => window.open('https://wa.me/231778199366', '_blank')} className="border-gray-600 text-slate-50 bg-red-600 hover:bg-red-500">
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp: +231 778 199 366
              </Button>
              <Button variant="outline" onClick={() => window.open('mailto:novamind@baysahdesign.com', '_blank')} className="border-gray-600 text-white bg-red-600 hover:bg-red-500">
                <Mail className="h-4 w-4 mr-2" />
                novamind@baysahdesign.com
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Dashboard;