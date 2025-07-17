
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Settings, History, Crown, LogOut } from 'lucide-react';

export const UserDropdown = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-500';
      case 'pro': return 'bg-blue-500';
      case 'premium': return 'bg-purple-500';
      case 'pay_as_you_go': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={(profile as any)?.avatar_url} alt={profile?.full_name || user?.email} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 bg-gray-800 border-gray-700 z-50" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none text-white">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-gray-400">
              {user?.email}
            </p>
            <div className="flex items-center space-x-2">
              <Badge className={`${getPlanColor(profile?.plan || 'free')} text-white capitalize`}>
                {profile?.plan || 'free'}
              </Badge>
              <span className="text-xs text-gray-400">
                {profile?.plan === 'premium' 
                  ? 'Unlimited messages' 
                  : `${profile?.messages_remaining || 0} messages left`
                }
              </span>
            </div>
            {profile?.plan === 'pay_as_you_go' && (
              <div className="text-xs text-green-400">
                {profile?.tokens_remaining || 0} tokens remaining
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem 
          onClick={() => navigate('/dashboard')}
          className="text-white hover:bg-gray-700 cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/profile')}
          className="text-white hover:bg-gray-700 cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/chat-history')}
          className="text-white hover:bg-gray-700 cursor-pointer"
        >
          <History className="mr-2 h-4 w-4" />
          Chat History
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/upgrade')}
          className="text-white hover:bg-gray-700 cursor-pointer"
        >
          <Crown className="mr-2 h-4 w-4" />
          Upgrade Plan
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => window.open('https://wa.me/231778199366', '_blank')}
          className="text-white hover:bg-gray-700 cursor-pointer"
        >
          <Crown className="mr-2 h-4 w-4" />
          Support
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-400 hover:bg-gray-700 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
