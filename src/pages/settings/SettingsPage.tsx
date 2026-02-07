import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    alert('Settings saved');
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
        <p className="text-slate-600">Settings page coming soon...</p>
        <Button onClick={handleSave} loading={loading} className="mt-4">
          Save Settings
        </Button>
      </Card>
    </div>

  );
};
