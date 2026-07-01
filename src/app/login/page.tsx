"use client";
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      toast.error('Invalid email or password');
      setLoading(false);
    } else {
      toast.success('Login successful!');
      router.push('/');
    }
  };

  return (
    <div className="login-page-wrapper">
      <Toaster position="top-center" />
      
      {/* Left Side: Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-logo">
             <img src="/logo.png" alt="Bharat Hydraulics Logo" />
          </div>
          
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to securely manage your inventory and sales.</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bharathydraulics.com"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side: Graphic */}
      <div className="login-graphic-section">
        <div className="graphic-content">
          <h2>Bharat Hydraulics</h2>
          <p>Enterprise-grade inventory, sales, and supply chain management engineered for scale.</p>
        </div>
      </div>
    </div>
  );
}
