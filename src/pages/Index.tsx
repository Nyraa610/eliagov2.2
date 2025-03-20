
import React from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="container px-4 py-16 space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to Our Application
        </h1>
        <p className="max-w-md mx-auto text-muted-foreground">
          Get started with your ESG journey today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
