"use client";

import SupportForm from "@/components/SupportForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Customer Support
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Need help? Our AI-powered support team is here to assist you 24/7.
            Fill out the form below and we'll get back to you within minutes.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <SupportForm 
            position="inline"
            accentColor="#2563eb"
          />
        </div>
      </div>
    </main>
  );
}
