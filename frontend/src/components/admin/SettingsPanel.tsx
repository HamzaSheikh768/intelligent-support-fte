"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw, Key, Bell, Database, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SettingsPanel() {
  const [loading, setLoading] = useState(false);
  
  // AI Model Settings
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("500");
  const [model, setModel] = useState("gpt-4");

  // Escalation Rules
  const [autoEscalateNegative, setAutoEscalateNegative] = useState(true);
  const [autoEscalateHighPriority, setAutoEscalateHighPriority] = useState(true);
  const [escalateAfterAttempts, setEscalateAfterAttempts] = useState("3");

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Knowledge Base
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState("24");

  // API Keys
  const [apiKey, setApiKey] = useState("sk-••••••••••••••••••••••••");

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Settings saved successfully");
    setLoading(false);
  };

  const handleReset = () => {
    setTemperature("0.7");
    setMaxTokens("500");
    setModel("gpt-4");
    setAutoEscalateNegative(true);
    setAutoEscalateHighPriority(true);
    setEscalateAfterAttempts("3");
    setEmailNotifications(true);
    setSlackNotifications(false);
    setSmsNotifications(false);
    setAutoSync(true);
    setSyncInterval("24");
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="space-y-6">
      {/* AI Model Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading">AI Model Settings</CardTitle>
                <CardDescription>Configure the AI behavior and response parameters</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature ({temperature})</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Higher = more creative, Lower = more focused
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum response length
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Escalation Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading">Escalation Rules</CardTitle>
                <CardDescription>Automatic escalation triggers and thresholds</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="font-medium">Auto-escalate Negative Sentiment</Label>
                  <p className="text-sm text-muted-foreground">
                    Escalate when sentiment &lt; 0.3
                  </p>
                </div>
                <Switch
                  checked={autoEscalateNegative}
                  onCheckedChange={setAutoEscalateNegative}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="font-medium">Auto-escalate High Priority</Label>
                  <p className="text-sm text-muted-foreground">
                    Immediately escalate high priority tickets
                  </p>
                </div>
                <Switch
                  checked={autoEscalateHighPriority}
                  onCheckedChange={setAutoEscalateHighPriority}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escalateAttempts">Escalate After Attempts</Label>
              <Select value={escalateAfterAttempts} onValueChange={setEscalateAfterAttempts}>
                <SelectTrigger id="escalateAttempts">
                  <SelectValue placeholder="Number of attempts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 attempt</SelectItem>
                  <SelectItem value="2">2 attempts</SelectItem>
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="4">4 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading">Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily summaries and alerts
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="font-medium">Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified in Slack channel
                  </p>
                </div>
                <Switch
                  checked={slackNotifications}
                  onCheckedChange={setSlackNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="font-medium">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Critical alerts via SMS
                  </p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Knowledge Base Sync */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading">Knowledge Base Sync</CardTitle>
                <CardDescription>Automatic synchronization settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="font-medium">Auto Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync knowledge base
                </p>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="syncInterval">Sync Interval (hours)</Label>
              <Select value={syncInterval} onValueChange={setSyncInterval}>
                <SelectTrigger id="syncInterval">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every hour</SelectItem>
                  <SelectItem value="6">Every 6 hours</SelectItem>
                  <SelectItem value="12">Every 12 hours</SelectItem>
                  <SelectItem value="24">Every 24 hours</SelectItem>
                  <SelectItem value="168">Once a week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* API Key Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading">API Key Management</CardTitle>
                <CardDescription>Manage your API keys securely</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Current API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  readOnly
                  className="bg-background/50 flex-1"
                />
                <Button variant="outline" className="border-border/50">
                  Regenerate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep your API key secret. Never share it publicly.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex items-center justify-end gap-4"
      >
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-border/50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>
    </div>
  );
}
