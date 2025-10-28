import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthActions } from '@/lib/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
const PasswordRequirement = ({ isValid, text }: { isValid: boolean; text: string }) => (
  <div className={cn("flex items-center text-sm", isValid ? "text-green-600" : "text-muted-foreground")}>
    {isValid ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4 text-red-500" />}
    {text}
  </div>
);
export function SignUpPage() {
  const navigate = useNavigate();
  const { signup } = useAuthActions();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const passwordValidations = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
  }, [password]);
  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("Password does not meet all requirements.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await signup({ name, email, password });
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred during signup.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full bg-muted/40 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
            <CardDescription>Join AetherLog to manage your call records.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="Matt Lilly" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="matt.lilly@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                <PasswordRequirement isValid={passwordValidations.length} text="8+ characters" />
                <PasswordRequirement isValid={passwordValidations.uppercase} text="1 uppercase" />
                <PasswordRequirement isValid={passwordValidations.lowercase} text="1 lowercase" />
                <PasswordRequirement isValid={passwordValidations.number} text="1 number" />
                <PasswordRequirement isValid={passwordValidations.special} text="1 special char" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !isPasswordValid || password !== confirmPassword}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Sign Up
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground justify-center">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}