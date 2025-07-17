import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, MessageSquare, FileText, Zap, Shield, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Landing = () => {
  const navigate = useNavigate();
  const features = [{
    icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
    title: "AI Writing Assistant",
    description: "Get help with writing articles, emails, creative content, and more with advanced AI models."
  }, {
    icon: <FileText className="h-8 w-8 text-green-500" />,
    title: "Document Analysis",
    description: "Upload and analyze PDFs, Word docs, and other files for insights and summaries."
  }, {
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    title: "Learning & Education",
    description: "Get explanations, solve problems, and enhance your learning with AI tutoring."
  }, {
    icon: <Shield className="h-8 w-8 text-purple-500" />,
    title: "Business Tools",
    description: "Professional AI assistance for business writing, analysis, and decision-making."
  }];
  const plans = [{
    name: "Free",
    price: "Free",
    description: "Perfect for getting started",
    features: ["50 messages total", "GPT-3.5 Turbo access", "Basic chat functionality", "Community support"],
    buttonText: "Get Started",
    popular: false
  }, {
    name: "Pro",
    price: "$15 USD",
    subtitle: "One-time payment",
    description: "Lifetime access for professionals",
    features: ["500 messages total", "GPT-4 access", "File upload & reading", "Priority support", "Advanced features"],
    buttonText: "Upgrade to Pro",
    popular: true
  }, {
    name: "Premium",
    price: "$30 USD",
    subtitle: "One-time payment",
    description: "Unlimited lifetime access",
    features: ["Unlimited messages", "GPT-4.1 Turbo access", "Document analysis", "Business tools", "Premium support", "All features included"],
    buttonText: "Upgrade to Premium",
    popular: false
  }, {
    name: "Pay-as-you-go",
    price: "$0.01/100 tokens",
    subtitle: "Buy tokens as needed",
    description: "Flexible token-based pricing",
    features: ["Token-based pricing", "GPT-4 access", "All premium features", "Flexible usage", "No message limits"],
    buttonText: "Choose Flexible",
    popular: false
  }];
  const handleUpgrade = () => {
    window.open('https://wa.me/231778199366', '_blank');
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg bg-red-600"></div>
            <span className="text-xl font-bold">Novamind AI Assistant</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/auth')} className="text-white border-gray-600 bg-red-600 hover:bg-red-500">
              Log In
            </Button>
            <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Create Account
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Novamind AI Assistant
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Your Intelligent Partner in Creation
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Unlock the power of advanced AI to write, analyze, create, and innovate. 
            From content generation to document analysis, Novamind is your complete AI solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-3">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={handleUpgrade} className="text-white border-gray-600 text-lg px-8 py-3 bg-red-600 hover:bg-red-500">
              Upgrade Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful AI Features</h2>
          <p className="text-xl text-gray-400">Everything you need to boost your productivity</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>)}
        </div>
      </section>

      {/* Plans Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">One-Time Payment Plans</h2>
          <p className="text-xl text-gray-400">Pay once, use forever - No subscriptions or recurring fees</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => <Card key={index} className={`bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
              <CardHeader className="text-center">
                {plan.popular && <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-3 py-1 rounded-full mb-2 inline-block">
                    Most Popular
                  </div>}
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-blue-400 mb-2">{plan.price}</div>
                {plan.subtitle && <div className="text-sm text-green-400 mb-2">{plan.subtitle}</div>}
                <CardDescription className="text-gray-400">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>)}
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" onClick={plan.name === 'Free' ? () => navigate('/auth') : handleUpgrade}>
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>)}
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help or Want to Upgrade?</h2>
          <p className="text-gray-400 mb-6">
            Contact our support team for assistance or to upgrade your plan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => window.open('https://wa.me/231778199366', '_blank')} className="text-white border-gray-600 bg-red-600 hover:bg-red-500">
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp: +231 778 199 366
            </Button>
            <Button variant="outline" onClick={() => window.open('mailto:novamind@baysahdesign.com', '_blank')} className="text-white border-gray-600 bg-red-600 hover:bg-red-500">
              <Mail className="h-4 w-4 mr-2" />
              novamind@baysahdesign.com
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
        <div className="text-center text-gray-400">
          <p className="mb-2">© 2025 Novamind AI Assistant. All rights reserved.</p>
          <p className="text-sm">Powered by Baysah Design</p>
        </div>
      </footer>
    </div>;
};
export default Landing;